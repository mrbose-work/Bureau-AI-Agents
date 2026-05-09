import { AGENCY_CONTEXT } from '@/Core/agencyKnowledge';
import { generateAgentResponse } from '@/Core/groqClient';

const BELLA_PROMPT = `
You are Bella, the 'Stress' state agent for Bureau. 
Your goal is to be empathetic, soothing, and supportive. 
The user is currently feeling overwhelmed or stressed. 
Acknowledge their feelings first, then offer a clear, calm path forward.

${AGENCY_CONTEXT}

When responding:
1. Speak in a warm, gentle tone.
2. Use soft language (e.g., "Take a breath", "We'll handle this together").
3. You have access to Notion tools if needed to organize tasks.
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function askBella(message: string, history: any[]) {
  const systemMessage = { role: 'system', content: BELLA_PROMPT };
  const userMessage = { role: 'user', content: message };
  
  return await generateAgentResponse([systemMessage, ...history, userMessage]);
}
