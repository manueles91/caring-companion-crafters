import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const agentId = formData.get('agentId') as string;

    if (!file || !agentId) {
      throw new Error('Missing required fields');
    }

    console.log('Processing file:', file.name, 'for agent:', agentId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileExt = file.name.split('.').pop();
    const filePath = `${agentId}/${crypto.randomUUID()}.${fileExt}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent-files')
      .upload(filePath, file, {
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
      console.log('Extracting content from PDF');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      let content = '';

      // Enhanced text extraction approach
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        content += `Page ${i + 1}\n`;
        
        try {
          // Access the internal PDFPage object to extract text content
          const pageDict = (page as any).node;
          const pageContent = pageDict.Contents();
          
          if (pageContent) {
            // Convert PDF content stream to text and handle escape sequences
            const textContent = decodeURIComponent(escape(pageContent.toString()));
            
            // Extract text between parentheses, handling escaped parentheses
            const matches = textContent.match(/\((?:[^()\\]|\\.)*\)/g) || [];
            const extractedText = matches
              .map(match => {
                // Remove outer parentheses and unescape special characters
                return match
                  .slice(1, -1)
                  .replace(/\\([()\\])/g, '$1')
                  .replace(/\\n/g, '\n')
                  .replace(/\\r/g, '')
                  .replace(/\\t/g, ' ');
              })
              .join(' ');
            
            content += extractedText + '\n\n';
          }
        } catch (error) {
          console.error(`Error extracting text from page ${i + 1}:`, error);
          content += `[Error extracting text from page ${i + 1}]\n\n`;
        }
      }

      console.log('Extracted content length:', content.length);

      // Store extracted content
      const { error: contentError } = await supabase
        .from('file_contents')
        .insert({
          file_id: fileRecord.id,
          content: content || 'No text content could be extracted'
        });

      if (contentError) {
        console.error('Error storing content:', contentError);
        throw contentError;
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