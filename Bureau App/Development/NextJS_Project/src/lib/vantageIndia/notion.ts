// Vantage India Notion integration — separate workspace/token from Bureau.
import { Client } from '@notionhq/client';

const TASKS_DB_ID = '3bb41519-ecd0-806d-afec-c1aed8dc3e28';
const PROJECTS_DB_ID = '3bb41519-ecd0-80cb-80d0-fc17f441379e';
const HR_DB_ID = '3b841519-ecd0-8064-9c75-f42271db7b16';
const DAILY_REPORTS_DB_ID = '3d641519-ecd0-8104-8286-dbd802351e7b'; // lives inside Vantage India Vault
const ATTENDANCE_DB_ID = '3d641519-ecd0-81f6-87a8-f4d10a577ed9'; // lives inside Vantage India Vault

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

export interface DailyReportEntry {
  staffName: string;
  phone: string;
  status: 'update' | 'completed' | 'blocked' | 'unclear';
  summary: string;
  rawMessage: string;
  timestamp: number; // ms epoch
}

export async function createDailyReportEntry(entry: DailyReportEntry) {
  const notion = getClient();
  const dataSourceId = await getDataSourceId(DAILY_REPORTS_DB_ID);
  const isoDate = new Date(entry.timestamp).toISOString();

  await notion.pages.create({
    parent: { type: 'data_source_id', data_source_id: dataSourceId },
    properties: {
      Name: { title: [{ text: { content: `${entry.staffName} — ${isoDate.slice(0, 10)}` } }] },
      Staff: { rich_text: [{ text: { content: entry.staffName } }] },
      Phone: { phone_number: entry.phone },
      Status: { select: { name: entry.status } },
      Summary: { rich_text: [{ text: { content: entry.summary } }] },
      'Raw Message': { rich_text: [{ text: { content: entry.rawMessage } }] },
      Date: { date: { start: isoDate } },
    },
  });
}

export interface AttendanceEntry {
  staffName: string;
  phone: string;
  dateKey: string; // YYYY-MM-DD
  checkInTime?: string; // e.g. "09:51"
  checkOutTime?: string; // e.g. "18:26"
  minutesLate?: number; // vs 10:00, only if late
  minutesAfterSix?: number; // checkout minutes past 18:00
  status?: 'On time' | 'Late' | 'No check-in recorded'; // omit to leave existing status untouched
}

export async function upsertAttendanceEntry(entry: AttendanceEntry) {
  const notion = getClient();
  const dataSourceId = await getDataSourceId(ATTENDANCE_DB_ID);

  // Look for an existing row for this staff member + date, so check-in and
  // check-out messages (sent separately) merge into one row.
  const existing = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      and: [
        { property: 'Staff', rich_text: { equals: entry.staffName } },
        { property: 'Date', date: { equals: entry.dateKey } },
      ],
    },
    page_size: 1,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: any = {
    Name: { title: [{ text: { content: `${entry.staffName} — ${entry.dateKey}` } }] },
    Staff: { rich_text: [{ text: { content: entry.staffName } }] },
    Phone: { phone_number: entry.phone },
    Date: { date: { start: entry.dateKey } },
  };
  if (entry.status) properties['Attendance Status'] = { select: { name: entry.status } };
  if (entry.checkInTime) properties['Check-in Time'] = { rich_text: [{ text: { content: entry.checkInTime } }] };
  if (entry.checkOutTime) properties['Check-out Time'] = { rich_text: [{ text: { content: entry.checkOutTime } }] };
  if (typeof entry.minutesLate === 'number') properties['Minutes Late'] = { number: entry.minutesLate };
  if (typeof entry.minutesAfterSix === 'number') properties['Minutes After 6PM Checkout'] = { number: entry.minutesAfterSix };

  if (existing.results.length > 0) {
    // Merge: only overwrite fields we have new data for.
    const page = existing.results[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingProps = (page as any).properties;
    const merged = { ...properties };
    if (!entry.checkInTime && existingProps['Check-in Time']?.rich_text?.[0]?.plain_text) {
      merged['Check-in Time'] = existingProps['Check-in Time'];
    }
    if (!entry.checkOutTime && existingProps['Check-out Time']?.rich_text?.[0]?.plain_text) {
      merged['Check-out Time'] = existingProps['Check-out Time'];
    }
    await notion.pages.update({ page_id: page.id, properties: merged });
  } else {
    await notion.pages.create({
      parent: { type: 'data_source_id', data_source_id: dataSourceId },
      properties,
    });
  }
}

export async function getAttendanceForDate(dateKey: string) {
  const notion = getClient();
  const dataSourceId = await getDataSourceId(ATTENDANCE_DB_ID);
  const res = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: { property: 'Date', date: { equals: dateKey } },
    page_size: 100,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.results.map((r: any) => r.properties.Staff?.rich_text?.[0]?.plain_text as string);
}

export { TASKS_DB_ID, PROJECTS_DB_ID, HR_DB_ID, DAILY_REPORTS_DB_ID, ATTENDANCE_DB_ID };
