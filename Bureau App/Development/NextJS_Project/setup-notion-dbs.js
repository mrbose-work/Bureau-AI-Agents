// Bureau — Notion Database Provisioning Script
// Creates all 7 core databases in your Notion workspace

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY || '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' });

const databases = [
  {
    name: '📥 Bureau Inbox',
    properties: {
      Name: { title: {} },
      Sender: { rich_text: {} },
      Platform: { select: { options: [{ name: 'WhatsApp', color: 'green' }, { name: 'Gmail', color: 'red' }, { name: 'LinkedIn', color: 'blue' }, { name: 'Instagram', color: 'pink' }, { name: 'Facebook', color: 'purple' }] } },
      Priority: { select: { options: [{ name: 'P1', color: 'red' }, { name: 'P2', color: 'yellow' }, { name: 'P3', color: 'green' }] } },
      Status: { select: { options: [{ name: 'Unread', color: 'red' }, { name: 'Read', color: 'yellow' }, { name: 'Replied', color: 'green' }, { name: 'Escalated', color: 'orange' }] } },
      Date: { date: {} },
    }
  },
  {
    name: '👥 Bureau Clients',
    properties: {
      Name: { title: {} },
      Contact: { rich_text: {} },
      Status: { select: { options: [{ name: 'Active', color: 'green' }, { name: 'VIP', color: 'yellow' }, { name: 'Lead', color: 'blue' }, { name: 'Pipeline', color: 'purple' }, { name: 'Inactive', color: 'gray' }] } },
      Revenue: { number: { format: 'rupee' } },
      Service: { select: { options: [{ name: 'Bureau Systems', color: 'red' }, { name: 'Bureau Signal', color: 'yellow' }, { name: 'Bureau Front', color: 'default' }] } },
      Rating: { number: {} },
    }
  },
  {
    name: '📁 Bureau Projects',
    properties: {
      Name: { title: {} },
      Client: { rich_text: {} },
      Status: { select: { options: [{ name: 'Planning', color: 'gray' }, { name: 'Active', color: 'yellow' }, { name: 'In Review', color: 'blue' }, { name: 'On Hold', color: 'orange' }, { name: 'Completed', color: 'green' }] } },
      Priority: { select: { options: [{ name: 'P1', color: 'red' }, { name: 'P2', color: 'yellow' }, { name: 'P3', color: 'green' }] } },
      Progress: { number: { format: 'percent' } },
      'Due Date': { date: {} },
    }
  },
  {
    name: '✅ Bureau Tasks',
    properties: {
      Name: { title: {} },
      Project: { rich_text: {} },
      Assignee: { select: { options: [{ name: 'Ronit', color: 'blue' }, { name: 'Benjamin AI', color: 'yellow' }] } },
      Status: { select: { options: [{ name: 'To Do', color: 'gray' }, { name: 'In Progress', color: 'yellow' }, { name: 'Overdue', color: 'red' }, { name: 'Done', color: 'green' }] } },
      Priority: { select: { options: [{ name: 'P1', color: 'red' }, { name: 'P2', color: 'yellow' }, { name: 'P3', color: 'green' }] } },
      Deadline: { date: {} },
    }
  },
  {
    name: '💰 Bureau Invoices',
    properties: {
      Name: { title: {} },
      Client: { rich_text: {} },
      Amount: { number: { format: 'rupee' } },
      Status: { select: { options: [{ name: 'Draft', color: 'gray' }, { name: 'Sent', color: 'blue' }, { name: 'Paid', color: 'green' }, { name: 'Overdue', color: 'red' }] } },
      'Issue Date': { date: {} },
      'Due Date': { date: {} },
    }
  },
  {
    name: '📊 Bureau Finance',
    properties: {
      Name: { title: {} },
      Category: { select: { options: [{ name: 'Revenue', color: 'green' }, { name: 'Expense', color: 'red' }, { name: 'Investment', color: 'blue' }] } },
      Amount: { number: { format: 'rupee' } },
      Type: { select: { options: [{ name: 'Income', color: 'green' }, { name: 'Expense', color: 'red' }] } },
      Date: { date: {} },
    }
  },
  {
    name: '🚀 Bureau Growth',
    properties: {
      Name: { title: {} },
      Platform: { select: { options: [{ name: 'Instagram', color: 'pink' }, { name: 'LinkedIn', color: 'blue' }, { name: 'Website', color: 'green' }, { name: 'YouTube', color: 'red' }] } },
      Metric: { rich_text: {} },
      Value: { number: {} },
      Date: { date: {} },
    }
  },
];

async function createDatabases() {
  // First, find a parent page to put databases in (search for any page)
  const searchResult = await notion.search({ page_size: 1, filter: { value: 'page', property: 'object' } });
  
  let parentId;
  if (searchResult.results.length > 0) {
    parentId = searchResult.results[0].id;
    console.log('Using existing page as parent:', searchResult.results[0].id);
  } else {
    // Create a parent page
    const page = await notion.pages.create({
      parent: { type: 'workspace', workspace: true },
      properties: { title: { title: [{ text: { content: 'Bureau OS' } }] } },
    });
    parentId = page.id;
    console.log('Created parent page:', parentId);
  }

  const dbIds = {};

  for (const db of databases) {
    try {
      const result = await notion.databases.create({
        parent: { type: 'page_id', page_id: parentId },
        title: [{ text: { content: db.name } }],
        properties: db.properties,
      });
      dbIds[db.name] = result.id;
      console.log(`✅ Created: ${db.name} → ${result.id}`);
    } catch (err) {
      console.error(`❌ Failed: ${db.name} → ${err.message}`);
    }
  }

  // Write IDs to a JSON file for the app to use
  const outputPath = path.join(__dirname, 'notion-db-ids.json');
  fs.writeFileSync(outputPath, JSON.stringify(dbIds, null, 2));
  console.log('\n📁 Database IDs saved to:', outputPath);
  
  // Also update .env.local
  const envPath = path.join(__dirname, '.env.local');
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Replace the placeholder database ID
  const firstDbId = Object.values(dbIds)[0];
  envContent = envContent.replace('your_notion_database_id_here', firstDbId || 'your_notion_database_id_here');
  
  // Add all DB IDs as env vars
  for (const [name, id] of Object.entries(dbIds)) {
    const envKey = 'NOTION_DB_' + name.replace(/[^\w]/g, '_').replace(/__+/g, '_').toUpperCase();
    envContent += `\n${envKey}=${id}`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('📝 .env.local updated with database IDs');
}

createDatabases().catch(console.error);
