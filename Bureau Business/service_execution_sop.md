# Bureau — Internal Service Execution SOP
*Standard Operating Procedures for Project Delivery. Confidential internal document.*

---

## 1. Core Execution Principles
To maintain the high standards of the Bureau brand, all project delivery must align with these governing rules:
*   **Documentation-First**: No database, custom static page, or strategy document is delivered without a corresponding Loom walkthrough video and an internal instruction wiki.
*   **The Three-Click Rule**: A client or team member must be able to navigate to any crucial resource or database entry in a Bureau-built workspace in three clicks or fewer.
*   **Discretion & Cleanliness**: All staging and sandbox environments must use dummy data or generic information. Client databases must never be visible in public screenshots or marketing materials without written sign-off.
*   **Minimal Meetings**: We preserve client time and our own. Operational syncs are replaced with structured asynchronous updates (e.g., Loom walkthroughs, brief email summaries) whenever possible.

---

## 2. The Global Project Lifecycle

Every Bureau engagement—whether Systems, Front, or Signal—follows a systematic 5-phase delivery path.

```
[Phase 1: Discovery] ──> [Phase 2: Architecture] ──> [Phase 3: Technical Build]
                                                          │
[Phase 5: Handover & Support] <── [Phase 4: Refinement & QA] <┘
```

---

## 3. Practice-Specific Workflows

### 3.1 Practice I: Bureau Systems (Notion OS Build Lifecycle)

This SOP details how a custom database or corporate hub project is built and delivered.

#### Phase 1: Intake & Operational Audit
1.  **Kickoff**: Send the client the initial onboarding questionnaire and schedule a 45-minute discovery audit.
2.  **Briefing**: During the audit, use the [client_intake_brief.md](file:///c:/Users/mrbos/OneDrive/Desktop/Bureau/Bureau%20Business/client_intake_brief.md) to audit their current software tools, map operational friction points, and identify target data pillars.
3.  **Audit Sign-off**: Compile the notes and send the completed brief as a PDF via email to confirm alignment.

#### Phase 2: Architecture & Schema Blueprinting
1.  **Drafting the Blueprint**: Design the relational database schema (Entity Relationship Diagram) on paper or in a private Notion workspace. Map out database properties, relations, rollups, and user access levels.
2.  **Review Call**: Walk the client through the schema blueprint via a 15-minute Loom video. Do not build until the client approves the structural blueprint in writing.

#### Phase 3: The Staging Build (Sandbox)
1.  **Sandbox Workspace**: Create the workspace inside Bureau’s internal development account. Never build directly in the client's active workspace.
2.  **One-Shot Build Standard**: Set up the 1 or 2 core databases (e.g., simple contact repository or task list), configure basic properties, and design the main page layout.
3.  **Structured & Custom Build Standard**: Set up all database tables, establish relations, map dashboards, write internal templates, and configure automated workflows (e.g., Make/Zapier connections).
4.  **SOP Wiki**: Create the "Operating Manual" page inside the sidebar, detailing how the team should input data, update tasks, and archive records.

#### Phase 4: Refinement & QA
1.  **The Stress Test**: Run mock data through all pipelines (e.g., create a task, move it to in-progress, assign a contact, check relation rollups).
2.  **Formatting Audit**: Ensure typography follows a clean visual hierarchy. Use minimal colors, consistent database icons, and clear page headings.
3.  **First Handoff Review**: Record a 10-minute Loom video walking the client’s founder through the system. Allow 5 business days for client testing and feedback collection.

#### Phase 5: Live Handoff & Training
1.  **Workspace Transfer**: Duplicate the staging workspace into the client’s clean Notion account.
2.  **Live Onboarding**: Conduct a 1-hour team training workshop. Walk the staff through data inputs, task updates, and the internal SOP wiki.
3.  **Support Kickoff**: Initiate the 30-day post-handoff support period (for Custom builds) to handle minor property adjustments or troubleshooting.

---

### 3.2 Practice II: Bureau Front (Web Build Lifecycle - Wix, Framer, Custom HTML)

This SOP details how a client website is built, optimized, and deployed.

#### Phase 1: Layout & Copy Blueprinting
1.  **Wireframes**: Create a clean wireframe of the site structure (Hero section, Premise, Services, Pricing, Forms) in a layout draft.
2.  **Copywriting**: Write every line of website copy in a text document. Do not use placeholder text (Lorem Ipsum) in the final layout.
3.  **Approval**: Present the layout wireframe and copy document to the client. Secure written approval before beginning development.

#### Phase 2: The Staging Build
1.  **Sandbox Setup**: Create the staging site on a free subdomain (e.g., `clientname.wixsite.com`, `clientname.framer.website`, or an internal GitHub repository for custom static HTML).
2.  **Development Standards**:
    *   *Visuals*: Implement responsive layouts (desktop, tablet, mobile), optimize images to WebP format, and add smooth, subtle micro-animations.
    *   *Code*: For custom HTML sites, write semantic, validated markup, clean CSS grids, and optimized JavaScript.
3.  **Review Link**: Share the staging URL with the client. Allow up to 3 business days for a single round of visual edits.

#### Phase 3: Launch, SEO, & Handoff
1.  **DNS & Routing**: Configure domain settings at the registrar (GoDaddy, Namecheap, etc.) and point A records or CNAMEs to the hosting platform (Vercel, Wix, Framer).
2.  **SEO Audit**: Verify metadata tags, configure Open Graph social sharing images, verify XML sitemaps, and submit the URL to Google Search Console.
3.  **Performance Check**: Run the site through Google PageSpeed Insights. Mobile and Desktop performance scores must exceed 90.
4.  **Technical Manual**: Deliver a 5-minute Loom video showing the client how to modify text, upload images, or check form submissions independently.

---

### 3.3 Practice III: Bureau Signal (AI Strategy & Content Lifecycle)

This SOP details how content calendars and strategic roadmaps are delivered.

#### Phase 1: Search & Keyword Mapping
1.  **Technical SEO Audit**: Analyze the client's current digital footprint, domain authority, and competitor backlinks.
2.  **Keyword Blueprint**: Identify low-difficulty, high-intent keywords in the client's industry. Map them to specific content pillars.

#### Phase 2: Content Strategy & Briefing
1.  **Content Calendar**: Build a monthly Notion content planner outlining topics, platforms (LinkedIn, Instagram), publishing dates, and key objectives.
2.  **AI Copy Refinement**: Utilize AI prompts to generate content drafts, and manually refine every piece of copy to ensure it aligns with the brand's tone. Exclude generic AI catchphrases.

#### Phase 3: Monthly Review
1.  **Performance Report**: Deliver a monthly report summarizing traffic growth, keyword ranks, engagement metrics, and conversion rates.
2.  **Strategy Optimization**: Adjust the keyword map and content briefs for the upcoming month based on historical data.

---

## 4. Handoff & Project Closure Checklist

Before a project is marked as officially completed and handed over, the Lead Architect must check off the following items:

*   [ ] **Milestone Payments**: Final project invoice is paid and cleared.
*   [ ] **Permissions Transfer**: Client is set as the Workspace Owner (Notion) or Site Owner (Wix/Framer). Bureau access is downgraded to guest/editor level.
*   [ ] **Backups Exported**: A full HTML/markdown export of the systems database is created and delivered to the client as a offline archive.
*   [ ] **Walkthrough Loom**: Walkthrough video is recorded and linked inside the workspace or delivered via email.
*   [ ] **Support Terms Signed**: Support Retainer agreement is executed, or the 30-day free troubleshooting window is scheduled with explicit start and end dates.
