// Vantage India Notion integration — separate workspace/token from Bureau.
import { Client } from '@notionhq/client';

const TASKS_DB_ID = '3bb41519-ecd0-806d-afec-c1aed8dc3e28';
const PROJECTS_DB_ID = '3bb41519-ecd0-80cb-80d0-fc17f441379e';
const HR_DB_ID = '3b841519-ecd0-8064-9c75-f42271db7b16';

let client: Client | null = null;
const dataSourceIdCache = new Map<string, string>();

function getClient() {
  if (!client) {
    const token = process.env.NOTION_VANTAGE_TOKEN;
    if (!token) throw new Error('Missing NOTION_VANTAGE_TOKEN in .env.local');
    client = new Client({ auth: token });
  }
  return client;
}

// Notion API v5+ models databases as containers of "data sources" — queries
// go through dataSources.query using the data source id, not the database id.
async function getDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceIdCache.get(databaseId);
  if (cached) return cached;

  const notion = getClient();
  const db = await notion.databases.retrieve({ database_id: databaseId });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataSourceId = (db as any).data_sources?.[0]?.id;
  if (!dataSourceId) throw new Error(`No data source found for database ${databaseId}`);

  dataSourceIdCache.set(databaseId, dataSourceId);
  return dataSourceId;
}

export interface VantageTask {
  id: string;
  name: string;
  status: string;
  ownerNames: string[];
  dateStart: string | null;
  dateEnd: string | null;
  daysDelayed: number | null;
  notes: string;
}

export interface VantageStaff {
  fullName: string;
  phone: string | null;
  employeeStatus: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function plainTitle(prop: any): string {
  return prop?.title?.[0]?.plain_text ?? '';
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function plainText(prop: any): string {
  return prop?.rich_text?.[0]?.plain_text ?? '';
}

export async function getOpenTasks(): Promise<VantageTask[]> {
  const notion = getClient();
  const dataSourceId = await getDataSourceId(TASKS_DB_ID);
  const tasks: VantageTask[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        or: [
          { property: 'Status', status: { equals: 'Not started' } },
          { property: 'Status', status: { equals: 'In progress' } },
        ],
      },
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of res.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (page as any).properties;
      tasks.push({
        id: page.id,
        name: plainTitle(p['Task Name']),
        status: p.Status?.status?.name ?? 'Unknown',
        ownerNames: (p['Task Owner']?.people ?? []).map((person: { name?: string }) => person.name ?? 'Unassigned'),
        dateStart: p.Date?.date?.start ?? null,
        dateEnd: p.Date?.date?.end ?? null,
        daysDelayed: typeof p['Days Delayed']?.formula?.number === 'number' ? p['Days Delayed'].formula.number : null,
        notes: plainText(p.Notes),
      });
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return tasks;
}

export async function getStaffDirectory(): Promise<VantageStaff[]> {
  const notion = getClient();
  const dataSourceId = await getDataSourceId(HR_DB_ID);
  const staff: VantageStaff[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const page of res.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = (page as any).properties;
      staff.push({
        fullName: plainTitle(p['Full Name']).trim(),
        phone: p['Phone Number']?.phone_number ?? null,
        employeeStatus: p['Employee Status']?.status?.name ?? null,
      });
    }

    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return staff;
}

export { TASKS_DB_ID, PROJECTS_DB_ID, HR_DB_ID };
