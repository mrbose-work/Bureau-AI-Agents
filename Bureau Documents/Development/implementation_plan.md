# Bureau Business Operations: Workflow & Collaboration Plan

This document outlines the operational workflow for the next phase of Bureau, effectively splitting responsibilities between AI agents (Claude and Antigravity) to maximize efficiency, with GitHub acting as the central nervous system.

## 1. The Division of Labor

### 🧠 Claude's Responsibilities (The Creative & Strategy Engine)
*   **Brand Identity**: Refining the Brand Bible, visual language, and tone.
*   **UI/UX Design**: Generating conceptual designs, layouts, and user flows.
*   **Business Strategy**: Expanding the SEO Strategy, drafting content, and defining agency services.
*   **General Operations**: Handling the bulk of non-technical "Bureau Business" documentation and strategy.

### ⚙️ Antigravity's Responsibilities (The Technical Execution Engine)
*   **Web Development**: Building the actual Bureau website based on Claude's designs.
*   **Automations & Integrations**: Setting up background processes, Notion/GitHub syncs, and AI Agent pipelines.
*   **Infrastructure**: Managing the codebase, Vercel deployments, and strict technical implementation.

---

## 2. The Infrastructure (The "Hub")

### 🗄️ GitHub (The Central Source of Truth)
*   **Repository**: `mrbose-work/Bureau-AI-Agents`
*   **Workflow**: 
    1. Claude generates strategy/design and outputs markdown/code.
    2. You (the user) commit Claude's output to the GitHub repo OR paste it to me to push.
    3. I pull the latest changes from GitHub, write the complex technical implementations, and push the final working code back to the repository.

### 📋 Notion (The Command Center)
*   **Database**: `Business Tasks DB`
*   **Workflow**: The master operations plan lives here. I will read this database to fetch my next technical task, update statuses to "In Progress," and mark them "Done" when the code is pushed to GitHub.

---

## Open Questions

Before we execute this plan, I need clarification on a few technical details:

> [!WARNING]
> **Notion Connection Lost**
> My connection to your Notion MCP Server just dropped (`notion-mcp-server not found`). Please verify your local MCP settings or restart the server so I can read the *Bureau Business Operations plan* in the Business Tasks DB.

> [!IMPORTANT]
> **Website Architecture**
> For the "hard work" of making the website: Are we continuing to build upon the Next.js `Bureau-App` framework I just pushed to GitHub, or are we starting a brand new repository for the public-facing agency site?

> [!IMPORTANT]
> **Automation Scope**
> You mentioned automations. Are these internal operational automations (e.g., syncing Notion to GitHub/Discord) or are we building client-facing AI Agent pipelines (like Benjamin & Bella)?

> [!NOTE]
> **Handoff Process**
> When Claude finishes a task, what is your preferred handoff method? Will you upload Claude's files directly to GitHub and tell me to "sync and build", or will you paste Claude's output directly into our chat here?
