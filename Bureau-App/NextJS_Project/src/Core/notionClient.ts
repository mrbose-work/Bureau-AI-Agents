import { Client } from '@notionhq/client';

let notionInstance: Client | null = null;

export function getNotionClient() {
  if (!notionInstance) {
    notionInstance = new Client({
      auth: process.env.NOTION_API_KEY || 'missing_key',
    });
  }
  return notionInstance;
}

export const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

export async function fetchActiveTasks() {
  if (!DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID. Please set it in Vercel environment variables.");
  
  try {
    const notion = getNotionClient();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error: Notion SDK type mismatch in query filter
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Status",
        status: {
          does_not_equal: "Done"
        }
      }
    });
    
    return response.results;
  } catch (error) {
    console.error("Notion API Error:", error);
    throw new Error("Failed to fetch tasks from Notion. Check your NOTION_API_KEY.");
  }
}

export async function createTask(title: string, priority: string = "Medium") {
  if (!DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID");
  
  try {
    const notion = getNotionClient();
    const response = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Priority: {
          select: {
            name: priority,
          },
        },
      },
    });
    return response;
  } catch (error) {
    console.error("Notion API Error:", error);
    throw new Error("Failed to create task in Notion.");
  }
}
