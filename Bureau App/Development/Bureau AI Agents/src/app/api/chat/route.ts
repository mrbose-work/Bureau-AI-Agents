import { NextResponse } from 'next/server';
import { determineUserState } from '@/Core/stateEngine';
import { askBenjamin, BENJAMIN_PROMPT } from '@/Benjamin/persona';
import { askBella, BELLA_PROMPT } from '@/Bella/persona';
import { executeSkill, NOTION_TOOLS } from '@/Core/skills';
import { generateAgentResponse } from '@/Core/groqClient';
import { fetchAgentMemories, fetchDesignLibrary, fetchHandoffMessages } from '@/Core/notionClient';

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
    
    // Fetch user memories & tastes from Notion
    let memoriesContext = "";
    try {
      const memories = await fetchAgentMemories();
      if (memories.length > 0) {
        memoriesContext = "\n\nSTORED USER PREFERENCES & MEMORIES:\n" + 
          memories.map((m: any) => `- [${m.category}] ${m.title}: ${m.content}`).join("\n");
      }
    } catch (memError) {
      console.warn("Failed to fetch memories, continuing without them:", memError);
    }

    // Fetch brand/design guidelines
    let designContext = "";
    try {
      const designRules = await fetchDesignLibrary();
      if (designRules.length > 0) {
        designContext = "\n\nSTORED DESIGN & BRAND GUIDELINES:\n" +
          designRules.map((d: any) => `- ${d.title}: Font Family: ${d.font}, Color Palette: ${d.palette}, Spacing: ${d.spacing}`).join("\n");
      }
    } catch (desError) {
      console.warn("Failed to fetch design library:", desError);
    }

    // Fetch handoff tasks delegated to the active agent
    let handoffContext = "";
    const activeAgentName = state === 'FLOW' ? 'Benjamin' : 'Bella';
    try {
      const pendingHandoffs = await fetchHandoffMessages(activeAgentName);
      if (pendingHandoffs.length > 0) {
        handoffContext = `\n\nPENDING HANDOFF TASKS DELEGATED TO YOU:\n` +
          pendingHandoffs.map((h: any) => `- From ${h.from}: "${h.title}" (Context: ${h.message}) [ID: ${h.id}]`).join("\n") +
          `\n\nIMPORTANT: If you complete any of these pending tasks, you MUST call the 'complete_handoff_message' tool with the corresponding ID to mark it completed.`;
      }
    } catch (handoffError) {
      console.warn("Failed to fetch handoff messages:", handoffError);
    }

    const systemPrompt = (state === 'FLOW' ? BENJAMIN_PROMPT : BELLA_PROMPT) + timeContext + memoriesContext + designContext + handoffContext;
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

    // Step 3: Handle Tool Calls (Self-Healing Loop)
    let currentAgentMessage = agentMessage;
    let loopCount = 0;
    const maxHealingRetries = 3;
    
    while (currentAgentMessage?.tool_calls && currentAgentMessage.tool_calls.length > 0 && loopCount < maxHealingRetries) {
      loopCount++;
      conversationHistory.push(currentAgentMessage);
      
      const toolPromises = currentAgentMessage.tool_calls.map(async (toolCall: any) => {
        const functionName = toolCall.function.name;
        let functionArgs = {};
        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
        } catch (e) {
          console.error("Failed to parse tool arguments:", e);
        }
        
        try {
          // Auto-inject isPersonal defaults based on the active agent (Bella = true, Benjamin = false)
          if (functionName === "create_notion_task" || functionName === "get_active_tasks") {
            if (functionArgs && (functionArgs as any).is_personal === undefined) {
              (functionArgs as any).is_personal = (state === 'STRESS'); // Bella is personal
            }
          }
          
          const toolResult = await executeSkill(functionName, functionArgs);
          return {
            tool_call_id: toolCall.id,
            role: "tool",
            content: toolResult,
          };
        } catch (skillError: any) {
          console.error(`Skill Execution Error on '${functionName}':`, skillError);
          const healingWarning = `SYSTEM NOTE: The tool call '${functionName}' failed with error: "${skillError.message || skillError}". Please analyze this error, adjust your parameters, and call the tool again with corrected arguments.`;
          return {
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ 
              error: `Skill failed to execute: ${skillError.message || skillError}`,
              instructions: healingWarning
            }),
          };
        }
      });
      
      const toolResults = await Promise.all(toolPromises);
      for (const res of toolResults) {
        conversationHistory.push(res);
      }
      
      // Get next agent message, allowing it to invoke tools again with corrected arguments
      const nextMessage = await generateAgentResponse(conversationHistory, undefined, NOTION_TOOLS);
      currentAgentMessage = nextMessage;
    }

    return NextResponse.json({
      agent: state === 'FLOW' ? 'Benjamin' : 'Bella',
      state: state,
      response: currentAgentMessage?.content || "I have processed your request."
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ 
      error: "Failed to process request",
      details: error.message || "Unknown error"
    }, { status: 500 });
  }
}
