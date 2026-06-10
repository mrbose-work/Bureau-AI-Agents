export const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";
export const MEETINGS_DATABASE_ID = process.env.NOTION_MEETINGS_DATABASE_ID || "";

function getHeaders() {
  return {
    "Authorization": `Bearer ${process.env.NOTION_API_KEY || ""}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };
}

// Map priority names to database options (P1, P2, P3)
function mapPriority(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
    case 'p1':
      return 'P1';
    case 'low':
    case 'p3':
      return 'P3';
    case 'medium':
    case 'p2':
    default:
      return 'P2';
  }
}

export async function fetchActiveTasks() {
  if (!DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID.");
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        filter: {
          property: "Status",
          status: {
            does_not_equal: "Done"
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion fetchActiveTasks API Error:", errorData);
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Parse results to be super clean and readable for the LLM
    return data.results.map((page: any) => {
      const taskName = page.properties["Task name"]?.title?.[0]?.plain_text || "Untitled";
      const status = page.properties["Status"]?.status?.name || "Unknown";
      const priority = page.properties["Priority"]?.select?.name || "None";
      const type = page.properties["TYPE"]?.select?.name || "None";
      const due = page.properties["Due"]?.date?.start || "No due date";
      return {
        id: page.id,
        name: taskName,
        status: status,
        priority: priority,
        type: type,
        due: due
      };
    });
  } catch (error) {
    console.error("Notion fetchActiveTasks Error:", error);
    throw new Error("Failed to fetch tasks from Notion.");
  }
}

export async function createTask(title: string, priority: string = "Medium") {
  if (!DATABASE_ID) throw new Error("Missing NOTION_DATABASE_ID");
  
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          "Task name": {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
          "Priority": {
            select: {
              name: mapPriority(priority),
            },
          },
          "Status": {
            status: {
              name: "Not Started"
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion createTask API Error:", errorData);
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Notion createTask Error:", error);
    throw new Error("Failed to create task in Notion.");
  }
}

export async function fetchUpcomingMeetings() {
  if (!MEETINGS_DATABASE_ID) throw new Error("Missing NOTION_MEETINGS_DATABASE_ID.");
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${MEETINGS_DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        filter: {
          property: "Meeting Status",
          status: {
            does_not_equal: "Done"
          }
        },
        sorts: [
          {
            property: "Date",
            direction: "ascending"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion fetchUpcomingMeetings API Error:", errorData);
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    return data.results.map((page: any) => {
      const name = page.properties["Name"]?.title?.[0]?.plain_text || "Untitled Meeting";
      const date = page.properties["Date"]?.date?.start || "No date set";
      const status = page.properties["Meeting Status"]?.status?.name || "Unknown";
      const type = page.properties["Meeting Type"]?.select?.name || "Other";
      const channel = page.properties["Channel"]?.select?.name || "Other";
      const email = page.properties["Email"]?.email || "No email";
      const notes = page.properties["Notes"]?.rich_text?.[0]?.plain_text || "";
      return {
        id: page.id,
        name,
        date,
        status,
        type,
        channel,
        email,
        notes
      };
    });
  } catch (error) {
    console.error("Notion fetchUpcomingMeetings Error:", error);
    throw new Error("Failed to fetch meetings from Notion.");
  }
}

export async function createMeeting(name: string, dateStr: string, type: string = "Discovery", channel: string = "Google Meet", notes: string = "") {
  if (!MEETINGS_DATABASE_ID) throw new Error("Missing NOTION_MEETINGS_DATABASE_ID");
  
  try {
    const properties: any = {
      "Name": {
        title: [
          {
            text: {
              content: name,
            },
          },
        ],
      },
      "Meeting Status": {
        status: {
          name: "Not started"
        }
      },
      "Meeting Type": {
        select: {
          name: type
        }
      },
      "Channel": {
        select: {
          name: channel
        }
      }
    };

    if (dateStr) {
      properties["Date"] = {
        date: {
          start: dateStr
        }
      };
    }

    if (notes) {
      properties["Notes"] = {
        rich_text: [
          {
            text: {
              content: notes
            }
          }
        ]
      };
    }

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        parent: { database_id: MEETINGS_DATABASE_ID },
        properties
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion createMeeting API Error:", errorData);
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Notion createMeeting Error:", error);
    throw new Error("Failed to create meeting in Notion.");
  }
}
