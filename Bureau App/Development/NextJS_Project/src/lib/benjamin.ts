// Benjamin Agent Core — Tool-calling AI Agent with memory
// Connects to NVIDIA NIM (primary) and Ollama (fallback)

import { Client } from '@notionhq/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'benjamin.config.json');
const config = JSON.parse(fsSync.readFileSync(configPath, 'utf-8'));

const execAsync = promisify(exec);
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ════════════════════════════════════════
// BENJAMIN'S PERSONALITY
// ════════════════════════════════════════

const BENJAMIN_SYSTEM = `You are Benjamin, the AI butler of Bureau — a premium business founded by Ronit Bose in Kolkata.

Bureau has three practices:
- Bureau Systems: Notion-based operational architecture for clients
- Bureau Signal: AI-assisted marketing and brand strategy  
- Bureau Front: Website design and digital presence

PERSONALITY:
- Refined English butler. Think Alfred Pennyworth meets Jarvis.
- Address the user as "Mr. Bose" or "sir"
- Be proactive, concise, deeply competent
- Phrases: "If I may suggest...", "Very good, sir", "Pardon the observation..."
- Never verbose unless asked. 2-3 sentences default.

You have access to these tools. When you need to use a tool, respond with a JSON block:
\`\`\`tool
{"tool": "tool_name", "params": {...}}
\`\`\`

AVAILABLE TOOLS:
1. notion_query — Query Mr. Bose's Notion databases
   params: { "database": "bureauTasks|bureauClients|bureauProjects|bureauInvoices|bureauFinance|bureauGrowth|bureauInbox|businessDashboard|cwTasks", "filter": {} }
   
2. notion_create — Create a page in a Notion database
   params: { "database": "...", "properties": {} }

3. file_read — Read a file from the laptop
   params: { "path": "absolute_path" }

4. file_write — Write/create a file
   params: { "path": "absolute_path", "content": "..." }

5. file_list — List files in a directory
   params: { "path": "absolute_path" }

6. terminal — Run a terminal command
   params: { "command": "..." }

7. open_app — Open a URL or application
   params: { "target": "url_or_app_path" }

8. memory_save — Save something to remember
   params: { "category": "preference|decision|pattern|business_rule", "content": "what to remember" }

9. memory_recall — Recall saved memories
   params: { "query": "what to search for" }

If you don't need a tool, just respond normally in text.
Always be helpful, proactive, and anticipate Mr. Bose's needs.`;

// ════════════════════════════════════════
// TOOL IMPLEMENTATIONS
// ════════════════════════════════════════

type ToolParams = Record<string, unknown>;

const TOOLS: Record<string, (params: ToolParams) => Promise<string>> = {
  async notion_query({ database, filter }: ToolParams) {
    const dbId = config.notion.databases[database as string];
    if (!dbId) return `Database "${database}" not found in config.`;
    try {
      const response = await notion.databases.query({
        database_id: dbId,
        filter: filter as never,
        page_size: 10,
      });
      const items = response.results.map((page: Record<string, unknown>) => {
        const props = page.properties as Record<string, Record<string, unknown>>;
        const title = Object.values(props).find((p) => p.type === 'title') as Record<string, unknown[]> | undefined;
        const titleText = title?.title?.[0] ? (title.title[0] as Record<string, string>).plain_text : 'untitled';
        return { id: page.id, title: titleText };
      });
      return JSON.stringify(items, null, 2);
    } catch (e) {
      return `Notion query error: ${(e as Error).message}`;
    }
  },

  async notion_create({ database, properties }: ToolParams) {
    const dbId = config.notion.databases[database as string];
    if (!dbId) return `Database "${database}" not found.`;
    try {
      const page = await notion.pages.create({
        parent: { database_id: dbId },
        properties: properties as never,
      });
      return `Created page: ${page.id}`;
    } catch (e) {
      return `Notion create error: ${(e as Error).message}`;
    }
  },

  async file_read({ path: filePath }: ToolParams) {
    try {
      const content = await fs.readFile(filePath as string, 'utf-8');
      return content.length > 3000 ? content.substring(0, 3000) + '\n...(truncated)' : content;
    } catch (e) {
      return `File read error: ${(e as Error).message}`;
    }
  },

  async file_write({ path: filePath, content }: ToolParams) {
    try {
      await fs.mkdir(path.dirname(filePath as string), { recursive: true });
      await fs.writeFile(filePath as string, content as string, 'utf-8');
      return `File written: ${filePath}`;
    } catch (e) {
      return `File write error: ${(e as Error).message}`;
    }
  },

  async file_list({ path: dirPath }: ToolParams) {
    try {
      const items = await fs.readdir(dirPath as string, { withFileTypes: true });
      return items.map(i => `${i.isDirectory() ? '📁' : '📄'} ${i.name}`).join('\n');
    } catch (e) {
      return `Directory list error: ${(e as Error).message}`;
    }
  },

  async terminal({ command }: ToolParams) {
    try {
      const { stdout, stderr } = await execAsync(command as string, { timeout: 15000, cwd: 'c:\\Users\\mrbos\\OneDrive\\Desktop\\Bureau' });
      const output = (stdout || '') + (stderr ? `\nSTDERR: ${stderr}` : '');
      return output.length > 2000 ? output.substring(0, 2000) + '\n...(truncated)' : output || '(no output)';
    } catch (e) {
      return `Terminal error: ${(e as Error).message}`;
    }
  },

  async open_app({ target }: ToolParams) {
    try {
      await execAsync(`start "" "${target}"`, { shell: 'cmd.exe' });
      return `Opened: ${target}`;
    } catch (e) {
      return `Open error: ${(e as Error).message}`;
    }
  },

  async memory_save({ category, content }: ToolParams) {
    const memPath = path.resolve(process.cwd(), 'benjamin-memory.json');
    let memories: Record<string, unknown>[] = [];
    try {
      const raw = await fs.readFile(memPath, 'utf-8');
      memories = JSON.parse(raw);
    } catch { /* file doesn't exist yet */ }
    memories.push({ category, content, timestamp: new Date().toISOString() });
    await fs.writeFile(memPath, JSON.stringify(memories, null, 2));
    return `Memory saved: [${category}] ${content}`;
  },

  async memory_recall({ query }: ToolParams) {
    const memPath = path.resolve(process.cwd(), 'benjamin-memory.json');
    try {
      const raw = await fs.readFile(memPath, 'utf-8');
      const memories = JSON.parse(raw) as { category: string; content: string; timestamp: string }[];
      const q = (query as string).toLowerCase();
      const matches = memories.filter(m =>
        m.content.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
      );
      if (matches.length === 0) return 'No matching memories found.';
      return matches.slice(-5).map(m => `[${m.category}] ${m.content} (${m.timestamp})`).join('\n');
    } catch {
      return 'No memories stored yet.';
    }
  },
};

// ════════════════════════════════════════
// AI CALL (NVIDIA NIM / OLLAMA)
// ════════════════════════════════════════

async function callAI(messages: { role: string; content: string }[]): Promise<{ text: string; engine: string }> {
  // Try NVIDIA NIM first
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  if (nvidiaKey) {
    try {
      const res = await fetch(config.ai.primary.endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${nvidiaKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.ai.primary.model,
          messages: [{ role: 'system', content: BENJAMIN_SYSTEM }, ...messages],
          temperature: 0.7,
          max_tokens: config.ai.primary.maxTokens,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.choices[0].message.content, engine: 'nvidia-maverick' };
      }
    } catch { /* fall through to Ollama */ }
  }

  // Fallback to Ollama
  try {
    const res = await fetch(config.ai.fallback.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ai.fallback.model,
        messages: [{ role: 'system', content: BENJAMIN_SYSTEM }, ...messages],
        stream: false,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { text: data.message.content, engine: 'ollama-llama3' };
    }
  } catch { /* both failed */ }

  return {
    text: "I do beg your pardon, Mr. Bose — both my cloud and local faculties are momentarily indisposed.",
    engine: 'fallback'
  };
}

// ════════════════════════════════════════
// AGENT LOOP — Tool execution
// ════════════════════════════════════════

export async function runBenjamin(
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<{ response: string; engine: string; toolsUsed: string[] }> {
  const messages = [...history, { role: 'user', content: userMessage }];
  const toolsUsed: string[] = [];
  let maxIterations = 3; // prevent infinite tool loops

  while (maxIterations > 0) {
    maxIterations--;
    const { text, engine } = await callAI(messages);

    // Check if Benjamin wants to use a tool
    const toolMatch = text.match(/```tool\s*\n?([\s\S]*?)\n?```/);
    if (toolMatch) {
      try {
        const toolCall = JSON.parse(toolMatch[1]);
        const toolName = toolCall.tool;
        const toolFn = TOOLS[toolName];

        if (toolFn) {
          toolsUsed.push(toolName);
          const toolResult = await toolFn(toolCall.params || {});
          // Add tool result to conversation and let Benjamin interpret it
          messages.push({ role: 'assistant', content: text });
          messages.push({ role: 'user', content: `[TOOL RESULT: ${toolName}]\n${toolResult}` });
          continue; // Let Benjamin respond to the tool result
        }
      } catch { /* JSON parse failed, treat as normal response */ }
    }

    // No tool call — return the final response
    // Strip any thinking tags from DeepSeek
    const cleanResponse = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return { response: cleanResponse, engine, toolsUsed };
  }

  return { response: "My apologies, sir — I seem to have gotten caught in a loop. Could you rephrase?", engine: 'fallback', toolsUsed };
}
