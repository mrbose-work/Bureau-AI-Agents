import { generateAgentResponse } from './groqClient';

export type UserState = 'FLOW' | 'STRESS';

/**
 * Uses Groq to analyze the user's input and determine if they are in a state of Flow or Stress.
 * @param userInput The user's message/input.
 * @returns 'FLOW' or 'STRESS'
 */
export async function determineUserState(userInput: string): Promise<UserState> {
  const prompt = `
You are an intent and emotion classifier for a personal operating system.
The user will provide an input, and you must classify their state as either 'FLOW' or 'STRESS'.

Definitions:
- FLOW: The user is focused, direct, asking for task execution, logical help, formatting, or general information. They are calm or neutral.
- STRESS: The user is overwhelmed, venting, confused, asking for emotional support, stuck, or using anxious language.

Respond strictly with a single word: either "FLOW" or "STRESS". Do not include any other text.

User Input: "${userInput}"
`;

  try {
    const response = await generateAgentResponse([{ role: 'user', content: prompt }]);
    const cleanResponse = (response?.content || "").trim().toUpperCase();
    
    if (cleanResponse.includes('STRESS')) {
      return 'STRESS';
    }
    return 'FLOW';
  } catch (error) {
    console.error("Failed to determine state, defaulting to FLOW.", error);
    return 'FLOW';
  }
}
