export const WORK_NOTION_API_KEY = process.env.WORK_NOTION_API_KEY || process.env.NOTION_API_KEY || "";
export const PERSONAL_NOTION_API_KEY = process.env.PERSONAL_NOTION_API_KEY || process.env.NOTION_API_KEY || "";

export const DATABASE_ID = process.env.WORK_NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID || "";
export const PERSONAL_DATABASE_ID = process.env.PERSONAL_NOTION_DATABASE_ID || "";
export const MEETINGS_DATABASE_ID = process.env.NOTION_MEETINGS_DATABASE_ID || "";

export const MEMORY_DATABASE_ID = process.env.NOTION_MEMORY_DATABASE_ID || "";
export const DESIGN_DATABASE_ID = process.env.NOTION_DESIGN_DATABASE_ID || "";
export const RESEARCH_DATABASE_ID = process.env.NOTION_RESEARCH_DATABASE_ID || "";
export const SKILLS_DATABASE_ID = process.env.NOTION_SKILLS_DATABASE_ID || "";
export const HANDOFF_DATABASE_ID = process.env.NOTION_HANDOFF_DATABASE_ID || "";

function getHeaders(isPersonal: boolean = false) {
  const token = isPersonal ? PERSONAL_NOTION_API_KEY : WORK_NOTION_API_KEY;
  return {
    "Authorization": `Bearer ${token}`,
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

export async function fetchActiveTasks(isPersonal: boolean = false) {
  const dbId = isPersonal ? PERSONAL_DATABASE_ID : DATABASE_ID;
  if (!dbId) throw new Error(`Missing tasks database ID. isPersonal: ${isPersonal}`);
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: getHeaders(isPersonal),
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

export async function createTask(title: string, priority: string = "Medium", isPersonal: boolean = false) {
  const dbId = isPersonal ? PERSONAL_DATABASE_ID : DATABASE_ID;
  if (!dbId) throw new Error(`Missing tasks database ID. isPersonal: ${isPersonal}`);
  
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: getHeaders(isPersonal),
      body: JSON.stringify({
        parent: { database_id: dbId },
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
      headers: getHeaders(false),
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

// ==========================================
// Agent Memory & Preferences (Work Workspace)
// ==========================================

export async function fetchAgentMemories() {
  if (!MEMORY_DATABASE_ID) return [];
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${MEMORY_DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion fetchAgentMemories API Error:", errorData);
      return [];
    }

    const data = await response.json();
    return data.results.map((page: any) => {
      const title = page.properties["Title"]?.title?.[0]?.plain_text || "Untitled";
      const category = page.properties["Category"]?.select?.name || "General";
      const content = page.properties["Content"]?.rich_text?.[0]?.plain_text || "";
      return { id: page.id, title, category, content };
    });
  } catch (error) {
    console.error("fetchAgentMemories Error:", error);
    return [];
  }
}

export async function addAgentMemory(title: string, category: string, content: string) {
  if (!MEMORY_DATABASE_ID) throw new Error("Missing NOTION_MEMORY_DATABASE_ID");
  
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        parent: { database_id: MEMORY_DATABASE_ID },
        properties: {
          "Title": {
            title: [{ text: { content: title } }]
          },
          "Category": {
            select: { name: category }
          },
          "Content": {
            rich_text: [{ text: { content: content } }]
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("addAgentMemory Error:", error);
    throw new Error("Failed to save memory to Notion.");
  }
}

// ==========================================
// Design & Brand Library (Work Workspace)
// ==========================================

export async function fetchDesignLibrary() {
  if (!DESIGN_DATABASE_ID) return [];
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DESIGN_DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Notion fetchDesignLibrary API Error:", errorData);
      return [];
    }

    const data = await response.json();
    return data.results.map((page: any) => {
      const title = page.properties["Title"]?.title?.[0]?.plain_text || "Untitled";
      const font = page.properties["Font Family"]?.rich_text?.[0]?.plain_text || "";
      const palette = page.properties["Color Palette"]?.rich_text?.[0]?.plain_text || "";
      const spacing = page.properties["Spacing & Layout"]?.rich_text?.[0]?.plain_text || "";
      const assets = page.properties["Assets & Links"]?.url || "";
      return { id: page.id, title, font, palette, spacing, assets };
    });
  } catch (error) {
    console.error("fetchDesignLibrary Error:", error);
    return [];
  }
}

// ==========================================
// Topic Research Store (Work Workspace)
// ==========================================

export async function fetchTopicResearch(topicName: string) {
  if (!RESEARCH_DATABASE_ID) return null;
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${RESEARCH_DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        filter: {
          property: "Title",
          title: {
            contains: topicName
          }
        }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (data.results.length === 0) return null;
    
    const page = data.results[0];
    return {
      id: page.id,
      title: page.properties["Title"]?.title?.[0]?.plain_text || "",
      summary: page.properties["Summary"]?.rich_text?.[0]?.plain_text || "",
      sources: page.properties["Source URLs"]?.url || ""
    };
  } catch (error) {
    console.error("fetchTopicResearch Error:", error);
    return null;
  }
}

export async function saveTopicResearch(title: string, summary: string, sourceUrls: string = "") {
  if (!RESEARCH_DATABASE_ID) throw new Error("Missing NOTION_RESEARCH_DATABASE_ID");
  
  try {
    // Check if it already exists to avoid duplicates
    const existing = await fetchTopicResearch(title);
    
    const body: any = {
      properties: {
        "Title": {
          title: [{ text: { content: title } }]
        },
        "Summary": {
          rich_text: [{ text: { content: summary } }]
        }
      }
    };
    
    if (sourceUrls) {
      body.properties["Source URLs"] = {
        url: sourceUrls
      };
    }
    
    let url = "https://api.notion.com/v1/pages";
    let method = "POST";
    
    if (existing) {
      url = `https://api.notion.com/v1/pages/${existing.id}`;
      method = "PATCH";
    } else {
      body.parent = { database_id: RESEARCH_DATABASE_ID };
    }
    
    const response = await fetch(url, {
      method,
      headers: getHeaders(false),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("saveTopicResearch Error:", error);
    throw new Error("Failed to save research to Notion.");
  }
}

// ==========================================
// Agent Handoff / Message Queue (Work Workspace)
// ==========================================

export async function fetchHandoffMessages(agentName: 'Bella' | 'Benjamin') {
  if (!HANDOFF_DATABASE_ID) return [];
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${HANDOFF_DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        filter: {
          and: [
            {
              property: "To",
              select: {
                equals: agentName
              }
            },
            {
              property: "Status",
              status: {
                equals: "Pending"
              }
            }
          ]
        }
      })
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((page: any) => ({
      id: page.id,
      title: page.properties["Title"]?.title?.[0]?.plain_text || "",
      from: page.properties["From"]?.select?.name || "",
      message: page.properties["Message / Context"]?.rich_text?.[0]?.plain_text || "",
      timestamp: page.properties["Timestamp"]?.date?.start || ""
    }));
  } catch (error) {
    console.error("fetchHandoffMessages Error:", error);
    return [];
  }
}

export async function createHandoffMessage(from: string, to: string, title: string, message: string) {
  if (!HANDOFF_DATABASE_ID) throw new Error("Missing NOTION_HANDOFF_DATABASE_ID");
  
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        parent: { database_id: HANDOFF_DATABASE_ID },
        properties: {
          "Title": {
            title: [{ text: { content: title } }]
          },
          "From": {
            select: { name: from }
          },
          "To": {
            select: { name: to }
          },
          "Status": {
            status: { name: "Pending" }
          },
          "Message / Context": {
            rich_text: [{ text: { content: message } }]
          },
          "Timestamp": {
            date: { start: new Date().toISOString() }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("createHandoffMessage Error:", error);
    throw new Error("Failed to create handoff message.");
  }
}

export async function updateHandoffStatus(id: string, status: 'Completed' | 'Failed') {
  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
      method: "PATCH",
      headers: getHeaders(false),
      body: JSON.stringify({
        properties: {
          "Status": {
            status: { name: status }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("updateHandoffStatus Error:", error);
    throw new Error("Failed to update handoff message status.");
  }
}

// ==========================================
// Skills Registry (Work Workspace)
// ==========================================

export async function fetchSkillsRegistry() {
  if (!SKILLS_DATABASE_ID) return [];
  
  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${SKILLS_DATABASE_ID}/query`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({})
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.results.map((page: any) => {
      const title = page.properties["Title"]?.title?.[0]?.plain_text || "Untitled";
      const description = page.properties["Description"]?.rich_text?.[0]?.plain_text || "";
      const instructions = page.properties["Instructions / System Prompt"]?.rich_text?.[0]?.plain_text || "";
      const tags = page.properties["Tags"]?.multi_select?.map((s: any) => s.name) || [];
      return { id: page.id, title, description, instructions, tags };
    });
  } catch (error) {
    console.error("fetchSkillsRegistry Error:", error);
    return [];
  }
}

export async function addSkillToRegistry(title: string, description: string, instructions: string, tags: string[] = []) {
  if (!SKILLS_DATABASE_ID) throw new Error("Missing NOTION_SKILLS_DATABASE_ID");
  
  try {
    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        parent: { database_id: SKILLS_DATABASE_ID },
        properties: {
          "Title": {
            title: [{ text: { content: title } }]
          },
          "Description": {
            rich_text: [{ text: { content: description } }]
          },
          "Instructions / System Prompt": {
            rich_text: [{ text: { content: instructions } }]
          },
          "Tags": {
            multi_select: tags.map(tag => ({ name: tag }))
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("addSkillToRegistry Error:", error);
    throw new Error("Failed to add skill to registry in Notion.");
  }
}
