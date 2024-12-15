import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as pdfjs from 'https://cdn.skypack.dev/pdfjs-dist@3.11.174/build/pdf.min.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, agentId } = await req.json();
    
    if (!file || !agentId) {
      throw new Error('Missing required fields');
    }

    console.log('Processing file:', file.name, 'for agent:', agentId);

    // Convert base64 to Blob
    const base64Data = file.base64.split(',')[1];
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: file.type });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileExt = file.name.split('.').pop();
    const filePath = `${agentId}/${crypto.randomUUID()}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent-files')
      .upload(filePath, blob, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Insert file record
    const { data: fileRecord, error: dbError } = await supabase
      .from('agent_files')
      .insert({
        agent_id: agentId,
        filename: file.name,
        file_path: filePath,
        content_type: file.type,
        size: file.size
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Extract content if PDF
    if (file.type === 'application/pdf') {
      console.log('Extracting content from PDF using OpenAI');
      
      // Convert PDF to PNG using pdf.js
      const arrayBuffer = bytes.buffer;
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to blob
      const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
      
      // Upload PNG to storage
      const pngPath = `${agentId}/${crypto.randomUUID()}.png`;
      const { data: pngUpload, error: pngError } = await supabase.storage
        .from('agent-files')
        .upload(pngPath, pngBlob, {
          contentType: 'image/png',
          upsert: false
        });

      if (pngError) throw pngError;

      // Get the public URL of the PNG
      const { data: { publicUrl } } = supabase.storage
        .from('agent-files')
        .getPublicUrl(pngPath);

      console.log('PNG Public URL:', publicUrl);

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please extract and summarize all the text content from this PDF document. Provide the content in a clear, structured format."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: publicUrl,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          max_tokens: 4096
        })
      });

      if (!openAIResponse.ok) {
        const errorData = await openAIResponse.text();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorData}`);
      }

      const openAIData = await openAIResponse.json();
      const extractedContent = openAIData.choices[0].message.content;

      console.log('Extracted content length:', extractedContent.length);

      // Store extracted content
      const { error: contentError } = await supabase
        .from('file_contents')
        .insert({
          file_id: fileRecord.id,
          content: extractedContent
        });

      if (contentError) {
        console.error('Error storing content:', contentError);
        throw contentError;
      }
      
      // Clean up temporary PNG
      const { error: deleteError } = await supabase.storage
        .from('agent-files')
        .remove([pngPath]);

      if (deleteError) {
        console.error('Error deleting temporary PNG:', deleteError);
      }
      
      console.log('PDF content extracted and stored successfully');
    }

    return new Response(
      JSON.stringify({ success: true, filePath }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing file:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});