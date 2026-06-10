import OpenAI from 'openai';

// Lazy initialization to prevent build-time crashes if API key is missing
let nvidiaInstance: OpenAI | null = null;

export function getLLMClient() {
  if (!nvidiaInstance) {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey && typeof window === 'undefined') {
      console.warn("NVIDIA_API_KEY is missing. AI features will be disabled.");
    }
    
    nvidiaInstance = new OpenAI({
      apiKey: apiKey || 'missing_key',
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  }
  return nvidiaInstance;
}

export const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";

export async function generateAgentResponse(
  messages: OpenAI.Chat.ChatCompletionMessageParam[], 
  model: string = DEFAULT_MODEL,
  tools?: OpenAI.Chat.ChatCompletionTool[]
) {
  try {
    const client = getLLMClient();
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
    console.error("Nvidia API Error:", error);
    throw new Error("Failed to generate AI response. Please check NVIDIA_API_KEY.");
  }
}
