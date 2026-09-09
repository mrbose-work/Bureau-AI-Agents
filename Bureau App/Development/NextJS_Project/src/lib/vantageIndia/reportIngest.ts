// Turns a raw WhatsApp message from the Vantage India group into a Notion
// log entry — either a work report or an attendance check-in/check-out.
// Uses the local Ollama model to extract structure — no cloud AI usage.
import { IncomingReport } from './whatsapp';
import { getStaffDirectory, createDailyReportEntry, upsertAttendanceEntry } from './notion';

const OLLAMA_ENDPOINT = process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.VANTAGE_OLLAMA_MODEL || 'qwen2.5:14b';

const OFFICE_START_MINUTES = 10 * 60; // 10:00
const OFFICE_END_MINUTES = 18 * 60; // 18:00

interface ParsedMessage {
  messageType: 'check_in' | 'check_out' | 'report' | 'other';
  time: string | null; // "HH:MM" 24h, only for check_in/check_out
  summary: string | null; // only for report
  status: 'update' | 'completed' | 'blocked' | 'unclear';
}

async function parseMessageWithOllama(text: string): Promise<ParsedMessage> {
  const prompt = `You are classifying a WhatsApp message from staff at an events/restaurant agency called Vantage India.

Message: "${text}"

Decide what type of message this is:
- "check_in": staff reporting they've arrived/started at the office (e.g. "check-in at 9:51", "in at 9:51am")
- "check_out": staff reporting they're leaving (e.g. "checkout at 6:26", "leaving now 6:30pm")
- "report": a description of work done/in progress
- "other": anything else (greetings, questions, unrelated chat)

If check_in or check_out, extract the clock time mentioned in 24-hour "HH:MM" format (assume standard office hours 10am-6pm if ambiguous about am/pm).

Reply with ONLY a JSON object, no other text, in this exact shape:
{"messageType": "check_in|check_out|report|other", "time": "HH:MM or null", "summary": "<one sentence third-person summary if report, else null>", "status": "update|completed|blocked|unclear"}`;

  const res = await fetch(`${OLLAMA_ENDPOINT}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      format: 'json',
    }),
  });

  if (!res.ok) throw new Error(`Ollama request failed: ${res.status}`);
  const data = await res.json();
  const content = data.message?.content ?? '{}';

  try {
    const parsed = JSON.parse(content);
    const messageType = ['check_in', 'check_out', 'report', 'other'].includes(parsed.messageType)
      ? parsed.messageType
      : 'other';
    return {
      messageType,
      time: typeof parsed.time === 'string' && /^\d{1,2}:\d{2}$/.test(parsed.time) ? parsed.time : null,
      summary: parsed.summary || null,
      status: ['update', 'completed', 'blocked', 'unclear'].includes(parsed.status) ? parsed.status : 'unclear',
    };
  } catch {
    return { messageType: 'other', time: null, summary: null, status: 'unclear' };
  }
}

async function matchStaffByPhone(phone: string) {
  const staff = await getStaffDirectory();
  const normalized = phone.replace(/\D/g, '').slice(-10); // last 10 digits
  return staff.find((s) => (s.phone ?? '').replace(/\D/g, '').slice(-10) === normalized) ?? null;
}

function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export async function logReportToNotion(report: IncomingReport) {
  const staff = await matchStaffByPhone(report.senderPhone);
  const label = staff?.fullName ?? report.senderName ?? report.senderPhone;
  const parsed = await parseMessageWithOllama(report.text);

  if (!staff) {
    // eslint-disable-next-line no-console
    console.warn(
      `No HR DB match for phone ${report.senderPhone} — add/verify their number in the Vantage India HR DB.`
    );
  }

  const dateKey = new Date(report.timestamp).toISOString().slice(0, 10);

  if (parsed.messageType === 'check_in' && parsed.time) {
    const minutesLate = Math.max(0, timeStringToMinutes(parsed.time) - OFFICE_START_MINUTES);
    // eslint-disable-next-line no-console
    console.log(`[attendance] ${label} — check-in ${parsed.time} (${minutesLate}m late)`);
    await upsertAttendanceEntry({
      staffName: label,
      phone: report.senderPhone,
      dateKey,
      checkInTime: parsed.time,
      minutesLate,
      status: minutesLate > 0 ? 'Late' : 'On time',
    });
    return;
  }

  if (parsed.messageType === 'check_out' && parsed.time) {
    const minutesAfterSix = Math.max(0, timeStringToMinutes(parsed.time) - OFFICE_END_MINUTES);
    // eslint-disable-next-line no-console
    console.log(`[attendance] ${label} — check-out ${parsed.time}`);
    await upsertAttendanceEntry({
      staffName: label,
      phone: report.senderPhone,
      dateKey,
      checkOutTime: parsed.time,
      minutesAfterSix,
      // status intentionally omitted — it reflects check-in lateness, not checkout
    });
    return;
  }

  if (parsed.messageType === 'report') {
    // eslint-disable-next-line no-console
    console.log(`[report] ${label} — [${parsed.status}] ${parsed.summary ?? report.text}`);
    await createDailyReportEntry({
      staffName: label,
      phone: report.senderPhone,
      status: parsed.status,
      summary: parsed.summary ?? report.text,
      rawMessage: report.text,
      timestamp: report.timestamp,
    });
    return;
  }

  // "other" messages (greetings, chat) are ignored — not logged anywhere.
}
