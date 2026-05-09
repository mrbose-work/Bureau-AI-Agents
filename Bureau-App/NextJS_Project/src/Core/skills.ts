import { createTask, fetchActiveTasks } from './notionClient';
import OpenAI from 'openai';

export const NOTION_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_notion_task",
      description: "Creates a new task in the user's Notion database.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the task.",
          },
          priority: {
            type: "string",
            enum: ["Low", "Medium", "High"],
            description: "The priority of the task.",
          },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_active_tasks",
      description: "Retrieves a list of active (not done) tasks from Notion.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

/**
 * Executes a tool call and returns the result as a string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function executeSkill(name: string, args: any) {
  switch (name) {
    case "create_notion_task": {
      const task = await createTask(args.title, args.priority || "Medium");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.stringify({ success: true, task_id: (task as any).id });
    }
    
    case "get_active_tasks": {
      const tasks = await fetchActiveTasks();
      return JSON.stringify(tasks);
    }
      
    default:
      throw new Error(`Unknown skill: ${name}`);
  }
}
