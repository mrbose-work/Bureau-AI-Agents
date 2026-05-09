import OpenAI from 'openai';

// Lazy initialization to prevent build-time crashes if API key is missing
let groqInstance: OpenAI | null = null;

export function getGroqClient() {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey && typeof window === 'undefined') {
      console.warn("GROQ_API_KEY is missing. Groq features will be disabled.");
    }
    
    groqInstance = new OpenAI({
      apiKey: apiKey || 'missing_key',
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return groqInstance;
}

export const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export async function generateAgentResponse(
  messages: OpenAI.Chat.ChatCompletionMessageParam[], 
  model: string = DEFAULT_MODEL,
  tools?: OpenAI.Chat.ChatCompletionTool[]
) {
  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      messages,
      model,
      temperature: 0.7,
      max_tokens: 1024,
      tools: tools,
      tool_choice: tools ? "auto" : undefined,
    });
    
    return completion.choices[0]?.message;
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate response from Groq. Please ensure GROQ_API_KEY is set in Vercel.");
  }
}
