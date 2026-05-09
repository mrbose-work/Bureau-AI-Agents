import { NextResponse } from 'next/server';
import { determineUserState } from '@/Core/stateEngine';
import { askBenjamin } from '@/Benjamin/persona';
import { askBella } from '@/Bella/persona';
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

    // Step 2: Get initial response (which might include tool calls)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let agentMessage: any;
    if (state === 'FLOW') {
      agentMessage = await askBenjamin(message, history || []);
    } else {
      agentMessage = await askBella(message, history || []);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationHistory: any[] = [...(history || []), { role: 'user', content: message }];

    // Step 3: Handle Tool Calls (Loop if necessary)
    let currentAgentMessage = agentMessage;
    
    // We only do 1 level of tool calling for now to keep it simple
    if (currentAgentMessage.tool_calls && currentAgentMessage.tool_calls.length > 0) {
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
