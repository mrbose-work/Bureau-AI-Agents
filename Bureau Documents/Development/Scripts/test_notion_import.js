const { Client } = require('@notionhq/client');
const notion = new Client({ auth: 'test' });
console.log('Client keys:', Object.keys(notion));
console.log('databases key:', notion.databases);
console.log('databases type:', typeof notion.databases);
if (notion.databases) {
    console.log('databases keys:', Object.keys(notion.databases));
}
