import { NextResponse } from 'next/server';
import { determineUserState } from '@/Core/stateEngine';
import { askBenjamin, BENJAMIN_PROMPT } from '@/Benjamin/persona';
import { askBella, BELLA_PROMPT } from '@/Bella/persona';
import { executeSkill } from '@/Core/skills';
import { generateAgentResponse } from '@/Core/groqClient';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Step 1: Determine User State
    const state = await determineUserState(message);

    // Get the correct system prompt with timezone injected
    const currentDateTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const timeContext = `\n\nCURRENT DATE & TIME: ${currentDateTime} (Asia/Kolkata timezone). Use this to resolve relative time periods like 'today', 'tomorrow', 'next week', etc.`;
    const systemPrompt = (state === 'FLOW' ? BENJAMIN_PROMPT : BELLA_PROMPT) + timeContext;
    const systemMessage = { role: 'system', content: systemPrompt };

    // Construct the full conversation history including system prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationHistory: any[] = [
      systemMessage,
      ...(history || []),
      { role: 'user', content: message }
    ];

    // Step 2: Get initial response (which might include tool calls)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let agentMessage: any;
    if (state === 'FLOW') {
      agentMessage = await askBenjamin(conversationHistory);
    } else {
      agentMessage = await askBella(conversationHistory);
    }

    // Step 3: Handle Tool Calls (Loop if necessary)
    let currentAgentMessage = agentMessage;
    
    // We only do 1 level of tool calling for now to keep it simple
    if (currentAgentMessage.tool_calls && currentAgentMessage.tool_calls.length > 0) {
      // Push the assistant message containing tool calls
      conversationHistory.push(currentAgentMessage);

      for (const toolCall of currentAgentMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        try {
          const toolResult = await executeSkill(functionName, functionArgs);
          
          conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: toolResult,
          });
        } catch (skillError) {
          console.error("Skill Execution Error:", skillError);
          conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ error: "Skill failed to execute." }),
          });
        }
      }

      // Get the final response after tool execution
      const finalMessage = await generateAgentResponse(conversationHistory);
      currentAgentMessage = finalMessage;
    }

    return NextResponse.json({
      agent: state === 'FLOW' ? 'Benjamin' : 'Bella',
      state: state,
      response: currentAgentMessage.content || "I have processed your request."
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      details: error.message || "Unknown error"
    }, { status: 500 });
  }
}
