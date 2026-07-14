import { 
  createTask, 
  fetchActiveTasks, 
  createMeeting, 
  fetchUpcomingMeetings,
  fetchAgentMemories,
  addAgentMemory,
  fetchDesignLibrary,
  fetchTopicResearch,
  saveTopicResearch,
  fetchHandoffMessages,
  createHandoffMessage,
  updateHandoffStatus,
  fetchSkillsRegistry,
  addSkillToRegistry
} from './notionClient';
import { fetchGitHubFile, commitGitHubFile } from './githubClient';
import { createGoogleDoc, createGoogleSlides, uploadToDrive } from './googleClient';
import OpenAI from 'openai';
import { generateAgentResponse } from './groqClient';

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
          is_personal: {
            type: "boolean",
            description: "Set to true for personal tasks (Personal Notion), otherwise false for work tasks."
          }
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
        properties: {
          is_personal: {
            type: "boolean",
            description: "Set to true to fetch tasks from the Personal Notion, otherwise false for the Work Notion."
          }
        },
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
  {
    type: "function",
    function: {
      name: "get_agent_memories",
      description: "Retrieves the stored user tastes, preferences, habits, wellbeing rules, and guidelines.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_agent_memory",
      description: "Saves a new fact, habit, taste, diet rule, or preference about the user so you remember it next time.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A short label for this memory, e.g., 'Boss Favorite Font' or 'Gym Time Habit'."
          },
          category: {
            type: "string",
            enum: ["Personal", "Work", "Habits", "General"],
            description: "The category of the memory."
          },
          content: {
            type: "string",
            description: "The actual detail, preference, or fact to remember."
          }
        },
        required: ["title", "category", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_design_library",
      description: "Retrieves styling rules, font families, color palettes, spacing guidelines, and layouts.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_topic_research",
      description: "Looks up previously researched summaries of a topic.",
      parameters: {
        type: "object",
        properties: {
          topic_name: {
            type: "string",
            description: "Name or keyword of the topic to look up."
          }
        },
        required: ["topic_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_topic_research",
      description: "Saves research summaries or learned facts about a topic to refer back to later.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The topic name or title."
          },
          summary: {
            type: "string",
            description: "A comprehensive summary of findings and research."
          },
          source_urls: {
            type: "string",
            description: "Optional URL list or source links."
          }
        },
        required: ["title", "summary"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_handoff_message",
      description: "Delegates a task or shares context with the other agent (e.g. Bella sending to Benjamin, or vice versa).",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            enum: ["Bella", "Benjamin"],
            description: "The agent who should receive this task."
          },
          title: {
            type: "string",
            description: "A short summary of what needs to be done, e.g., 'Reschedule Afternoon Call'."
          },
          message: {
            type: "string",
            description: "The detailed context or message to convey."
          }
        },
        required: ["to", "title", "message"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_handoff_messages",
      description: "Retrieves pending messages/tasks assigned to you by the other agent.",
      parameters: {
        type: "object",
        properties: {
          agent_name: {
            type: "string",
            enum: ["Bella", "Benjamin"],
            description: "Your name (the agent fetching tasks)."
          }
        },
        required: ["agent_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "complete_handoff_message",
      description: "Marks a delegated handoff task as completed or failed.",
      parameters: {
        type: "object",
        properties: {
          message_id: {
            type: "string",
            description: "The ID of the handoff message."
          },
          status: {
            type: "string",
            enum: ["Completed", "Failed"],
            description: "The status of the execution."
          }
        },
        required: ["message_id", "status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_custom_skills",
      description: "List all dynamic custom skills and workflows registered in the Notion Skills database.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "execute_custom_skill",
      description: "Executes a registered custom skill using its saved system instructions/prompt.",
      parameters: {
        type: "object",
        properties: {
          skill_title: {
            type: "string",
            description: "The name of the skill to execute (e.g. 'Draft Client Proposal')."
          },
          arguments: {
            type: "string",
            description: "Detailed input context, parameters, or instructions for the skill execution."
          }
        },
        required: ["skill_title", "arguments"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_new_skill",
      description: "Registers a new custom workflow or skill prompt into the Notion Skills database so you or the other agent can execute it later.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The name of the skill, e.g. 'Write Weekly Newsletter'."
          },
          description: {
            type: "string",
            description: "A short description of what the skill does."
          },
          instructions: {
            type: "string",
            description: "Detailed step-by-step prompt instructions the agent must follow to run this skill."
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags like 'Marketing', 'Writing', 'Finance'."
          }
        },
        required: ["title", "description", "instructions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "github_read_file",
      description: "Reads the content of a file in a GitHub repository.",
      parameters: {
        type: "object",
        properties: {
          repo: {
            type: "string",
            description: "The owner/repository name, e.g. 'mrbose-work/Bureau-AI-Agents'."
          },
          path: {
            type: "string",
            description: "The file path in the repository, e.g. 'src/app/page.tsx'."
          },
          branch: {
            type: "string",
            description: "Optional branch name (defaults to 'main')."
          }
        },
        required: ["repo", "path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "github_commit_file",
      description: "Modifies or creates a file in a GitHub repository and commits the changes.",
      parameters: {
        type: "object",
        properties: {
          repo: {
            type: "string",
            description: "The owner/repository name, e.g. 'mrbose-work/Bureau-AI-Agents'."
          },
          path: {
            type: "string",
            description: "The file path in the repository, e.g. 'src/app/page.tsx'."
          },
          content: {
            type: "string",
            description: "The complete content to write into the file."
          },
          commit_message: {
            type: "string",
            description: "A brief message explaining the change."
          },
          branch: {
            type: "string",
            description: "Optional branch name (defaults to 'main')."
          }
        },
        required: ["repo", "path", "content", "commit_message"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_google_doc",
      description: "Creates a new Google Doc with detailed text content inside your Google Drive.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the Google Document."
          },
          content: {
            type: "string",
            description: "The complete text content of the document."
          }
        },
        required: ["title", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_google_slides",
      description: "Creates a new Google Slides presentation (PPT) in your Google Drive.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The title of the slideshow presentation."
          },
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Slide Title" },
                body: { type: "string", description: "Slide bullet points or body text" }
              },
              required: ["title", "body"]
            },
            description: "A list of slides with title and body content."
           }
        },
        required: ["title", "slides"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "upload_to_drive",
      description: "Uploads a text or code file directly to Google Drive.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the file to save in Drive, e.g. 'notes.txt'."
          },
          content: {
            type: "string",
            description: "The file's text contents."
          },
          mime_type: {
            type: "string",
            description: "Optional MIME type (defaults to 'text/plain')."
           }
        },
        required: ["name", "content"]
      }
    }
  }
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
      const isPersonal = !!args.is_personal;
      const task = await createTask(title, priority, isPersonal);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return JSON.stringify({ success: true, task_id: (task as any).id });
    }
    
    case "get_active_tasks": {
      const isPersonal = !!args.is_personal;
      const tasks = await fetchActiveTasks(isPersonal);
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

    case "get_agent_memories": {
      const memories = await fetchAgentMemories();
      return JSON.stringify(memories);
    }

    case "add_agent_memory": {
      const title = args.title || "";
      const category = args.category || "General";
      const content = args.content || "";
      const memory = await addAgentMemory(title, category, content);
      return JSON.stringify({ success: true, memory_id: (memory as any).id });
    }

    case "get_design_library": {
      const library = await fetchDesignLibrary();
      return JSON.stringify(library);
    }

    case "get_topic_research": {
      const topicName = args.topic_name || "";
      const research = await fetchTopicResearch(topicName);
      return JSON.stringify(research || { message: "No research found for this topic." });
    }

    case "save_topic_research": {
      const title = args.title || "";
      const summary = args.summary || "";
      const sources = args.source_urls || "";
      const research = await saveTopicResearch(title, summary, sources);
      return JSON.stringify({ success: true, research_id: (research as any).id });
    }

    case "create_handoff_message": {
      const to = args.to || "Bella";
      const title = args.title || "";
      const message = args.message || "";
      const handoff = await createHandoffMessage(args.from || "System", to, title, message);
      return JSON.stringify({ success: true, message_id: (handoff as any).id });
    }

    case "get_handoff_messages": {
      const agentName = args.agent_name || "Bella";
      const messages = await fetchHandoffMessages(agentName);
      return JSON.stringify(messages);
    }

    case "complete_handoff_message": {
      const messageId = args.message_id || "";
      const status = args.status || "Completed";
      const updated = await updateHandoffStatus(messageId, status);
      return JSON.stringify({ success: true, message_id: (updated as any).id });
    }

    case "get_custom_skills": {
      const skills = await fetchSkillsRegistry();
      return JSON.stringify(skills);
    }

    case "execute_custom_skill": {
      const skillTitle = args.skill_title || "";
      const skillArgs = args.arguments || "";
      const registry = await fetchSkillsRegistry();
      const match = registry.find((s: any) => s.title.toLowerCase() === skillTitle.toLowerCase());
      if (!match) {
        return JSON.stringify({ error: `Skill '${skillTitle}' not found in registry.` });
      }
      
      const prompt = `You are executing the dynamic business skill: "${match.title}".
Instructions for this skill:
${match.instructions}

Arguments for this execution:
${typeof skillArgs === 'string' ? skillArgs : JSON.stringify(skillArgs, null, 2)}
`;

      const response = await generateAgentResponse([
        { role: 'system', content: prompt }
      ]);
      return JSON.stringify({
        success: true,
        skill_executed: match.title,
        output: response?.content || "No output generated."
      });
    }

    case "register_new_skill": {
      const title = args.title || "";
      const description = args.description || "";
      const instructions = args.instructions || "";
      const tags = args.tags || [];
      const result = await addSkillToRegistry(title, description, instructions, tags);
      return JSON.stringify({ success: true, skill_id: (result as any).id });
    }

    case "github_read_file": {
      const repo = args.repo || "";
      const path = args.path || "";
      const branch = args.branch || "main";
      const file = await fetchGitHubFile(repo, path, branch);
      return JSON.stringify(file);
    }

    case "github_commit_file": {
      const repo = args.repo || "";
      const path = args.path || "";
      const content = args.content || "";
      const msg = args.commit_message || "Code updated by agent";
      const branch = args.branch || "main";
      const result = await commitGitHubFile(repo, path, content, msg, branch);
      return JSON.stringify({ success: true, commit_sha: result.commit.sha });
    }

    case "create_google_doc": {
      const title = args.title || "";
      const content = args.content || "";
      const result = await createGoogleDoc(title, content);
      return JSON.stringify(result);
    }

    case "create_google_slides": {
      const title = args.title || "";
      const slides = args.slides || [];
      const result = await createGoogleSlides(title, slides);
      return JSON.stringify(result);
    }

    case "upload_to_drive": {
      const name = args.name || "";
      const content = args.content || "";
      const mime = args.mime_type || "text/plain";
      const result = await uploadToDrive(name, content, mime);
      return JSON.stringify(result);
    }
      
    default:
      throw new Error(`Unknown skill: ${name}`);
  }
}
