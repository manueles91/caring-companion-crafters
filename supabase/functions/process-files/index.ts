import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as pdfParse from 'https://esm.sh/pdf-parse@1.1.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing file upload request');
    const { filename, filePath, contentType, size, agentId } = await req.json();
    
    if (!filename || !filePath || !agentId) {
      console.error('Missing required fields:', { filename, filePath, agentId });
      throw new Error('Missing required fields');
    }

    console.log('Processing file:', filename, 'for agent:', agentId);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating database record');

    // Insert file record
    const { data: fileRecord, error: dbError } = await supabase
      .from('agent_files')
      .insert({
        agent_id: agentId,
        filename,
        file_path: filePath,
        content_type: contentType,
        size
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error inserting file record:', dbError);
      throw dbError;
    }

    // Extract content if PDF
    if (contentType === 'application/pdf') {
      console.log('Extracting content from PDF');
      
      try {
        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('agent-files')
          .download(filePath);

        if (downloadError) {
          console.error('Error downloading file:', downloadError);
          throw downloadError;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const pdfData = await pdfParse(arrayBuffer);
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