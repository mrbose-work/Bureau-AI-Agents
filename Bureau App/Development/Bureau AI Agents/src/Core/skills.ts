import { createTask, fetchActiveTasks, createMeeting, fetchUpcomingMeetings } from './notionClient';
import OpenAI from 'openai';

export const NOTION_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "create_notion_task",
      description: "Creates a new business or personal task in the user's Notion database.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the task.",
          },
          priority: {
            type: "string",
            enum: ["Low", "Medium", "High", "P1", "P2", "P3"],
            description: "The priority of the task (Low/P3, Medium/P2, High/P1).",
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
  {
    type: "function",
    function: {
      name: "get_upcoming_meetings",
      description: "Retrieves a list of upcoming meetings from the user's Notion database.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_meeting",
      description: "Schedules a new meeting in the user's Notion database.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name/subject of the meeting.",
          },
          date: {
            type: "string",
            description: "The start date and time of the meeting in ISO format (e.g. YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS).",
          },
          type: {
            type: "string",
            enum: ["Discovery", "Sales", "Delivery / Work Session", "Review", "Internal", "Other"],
            description: "The type of the meeting.",
          },
          channel: {
            type: "string",
            enum: ["In-person", "Google Meet", "Zoom", "Phone", "Other"],
            description: "The platform or method of the meeting.",
          },
          notes: {
            type: "string",
            description: "Any additional description or agenda details for the meeting.",
          }
        },
        required: ["name", "date"],
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
      const title = args.title || args.properties?.title || "";
      const priority = args.priority || args.properties?.priority || "Medium";
      const task = await createTask(title, priority);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.stringify({ success: true, task_id: (task as any).id });
    }
    
    case "get_active_tasks": {
      const tasks = await fetchActiveTasks();
      return JSON.stringify(tasks);
    }

    case "get_upcoming_meetings": {
      const meetings = await fetchUpcomingMeetings();
      return JSON.stringify(meetings);
    }

    case "create_meeting": {
      const meetingName = args.name || args.properties?.name || "";
      const date = args.date || args.properties?.date || "";
      const type = args.type || args.properties?.type || "Discovery";
      const channel = args.channel || args.properties?.channel || "Google Meet";
      const notes = args.notes || args.properties?.notes || "";
      const meeting = await createMeeting(meetingName, date, type, channel, notes);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.stringify({ success: true, meeting_id: (meeting as any).id });
    }
      
    default:
      throw new Error(`Unknown skill: ${name}`);
  }
}
