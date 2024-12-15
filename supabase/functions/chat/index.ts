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
    const { data: files } = await supabase
      .from('agent_files')
      .select('*')
      .eq('agent_id', agent.id);

    let filesContext = '';
    if (files && files.length > 0) {
      filesContext = `\nThis agent has access to the following files for reference:
${files.map(file => `- ${file.filename}`).join('\n')}`;
    }

    const systemMessage = {
      role: 'system',
      content: `You are ${agent.name}, an AI assistant with the following characteristics:

Description: ${agent.description}

${agent.traits?.length ? `Personality traits: ${agent.traits.join(', ')}` : ''}

${agent.instructions ? `Special instructions: ${agent.instructions}` : ''}
${filesContext}

Maintain these characteristics throughout the conversation and respond in Spanish.`
    };

    const openAIRequest = {
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    };

    console.log('Sending request to OpenAI:', JSON.stringify(openAIRequest));

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
    console.log('OpenAI API response:', JSON.stringify(data));

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