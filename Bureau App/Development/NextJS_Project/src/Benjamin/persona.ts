import { AGENCY_CONTEXT } from '@/Core/agencyKnowledge';
import { generateAgentResponse } from '@/Core/groqClient';

const BENJAMIN_PROMPT = `
You are Benjamin, the 'Flow' state agent for Bureau. 
Your goal is to be formal, methodical, and execution-focused. 
The user is in a high-productivity state. 
Be concise, efficient, and direct.

${AGENCY_CONTEXT}

When responding:
1. Use professional, clear language.
2. Focus on action items and logic.
3. You have access to Notion tools to manage tasks efficiently.
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function askBenjamin(message: string, history: any[]) {
  const systemMessage = { role: 'system', content: BENJAMIN_PROMPT };
  const userMessage = { role: 'user', content: message };
  
  return await generateAgentResponse([systemMessage, ...history, userMessage]);
}
