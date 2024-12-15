import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as pdfParse from 'https://esm.sh/pdf-parse@1.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, agentId } = await req.json();
    
    if (!file || !agentId) {
      throw new Error('Missing required fields');
    }

    console.log('Processing file:', file.name, 'for agent:', agentId);

    // Convert base64 to Blob/ArrayBuffer
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

    // Upload original file to storage
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
      console.log('Extracting content from PDF using pdf-parse');
      
      try {
        const dataBuffer = bytes.buffer;
        const pdfData = await pdfParse(dataBuffer);
        const extractedText = pdfData.text;
        
        console.log('Extracted text length:', extractedText.length);

        // Store extracted content
        const { error: contentError } = await supabase
          .from('file_contents')
          .insert({
            file_id: fileRecord.id,
            content: extractedText
          });

        if (contentError) {
          console.error('Error storing content:', contentError);
          throw contentError;
        }
        
        console.log('PDF content extracted and stored successfully');
      } catch (pdfError) {
        console.error('Error extracting PDF content:', pdfError);
        throw new Error(`Failed to extract PDF content: ${pdfError.message}`);
      }
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