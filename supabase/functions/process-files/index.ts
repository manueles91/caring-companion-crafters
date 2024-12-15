import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
      console.log('Extracting content from PDF using OpenAI');
      
      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('agent-files')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4o",
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
          ]
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