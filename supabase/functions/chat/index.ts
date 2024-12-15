import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { messages, agent } = await req.json();
    console.log('Processing chat request for agent:', agent.name);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch agent's files
    const { data: files, error: filesError } = await supabase
      .from('agent_files')
      .select('*')
      .eq('agent_id', agent.id);

    if (filesError) {
      console.error('Error fetching files:', filesError);
      throw filesError;
    }

    // Build context from files
    let filesContext = '';
    if (files && files.length > 0) {
      console.log('Found files for agent:', files.length);
      
      for (const file of files) {
        try {
          // Download file content from storage
          const { data: fileData, error: downloadError } = await supabase
            .storage
            .from('agent-files')
            .download(file.file_path);

          if (downloadError) {
            console.error('Error downloading file:', downloadError);
            continue;
          }

          // Convert file content to text
          let fileContent = '';
          if (file.content_type === 'application/pdf') {
            // For PDFs, we'll need to extract text - for now just mention it
            fileContent = `[Content from PDF file: ${file.filename}]`;
          } else {
            // For text files, read the content
            fileContent = await fileData.text();
          }

          filesContext += `\nContent from ${file.filename}:\n${fileContent}\n`;
        } catch (error) {
          console.error('Error processing file:', file.filename, error);
        }
      }
    }

    const systemMessage = {
      role: 'system',
      content: `You are ${agent.name}, an AI assistant with the following characteristics:

Description: ${agent.description}

${agent.traits?.length ? `Personality traits: ${agent.traits.join(', ')}` : ''}

${agent.instructions ? `Special instructions: ${agent.instructions}` : ''}

Knowledge Base:
${filesContext || 'No additional files provided.'}

Use this knowledge to inform your responses. When answering questions, refer to specific information from the files when relevant.
Maintain these characteristics throughout the conversation and respond in Spanish.`
    };

    console.log('System message prepared with file context');

    const openAIRequest = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    };

    console.log('Sending request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openAIRequest),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI API quota exceeded. Please check your billing details or try again later.'
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('Received response from OpenAI');

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected API response format:', data);
      throw new Error('Invalid response format from OpenAI API');
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});