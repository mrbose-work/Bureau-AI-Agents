// Standalone long-running process for the Vantage India WhatsApp bot.
// Run with: npm run whatsapp
//
// First run (no VANTAGE_WHATSAPP_GROUP_ID set yet): scan the QR code, then
// send any message in the Vantage India group — its ID will be printed to
// the console. Copy that into .env.local as VANTAGE_WHATSAPP_GROUP_ID and
// restart. From then on, the bot only listens to/acts in that one group.
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { startWhatsAppBot, IncomingReport, listJoinedGroups } from '../src/lib/vantageIndia/whatsapp';
import { logReportToNotion } from '../src/lib/vantageIndia/reportIngest';
import { startMorningScheduler } from '../src/lib/vantageIndia/scheduler';

const GROUP_ID = process.env.VANTAGE_WHATSAPP_GROUP_ID;

async function onGroupMessage(report: IncomingReport) {
  // eslint-disable-next-line no-console
  console.log(`[report] ${report.senderName ?? report.senderPhone}: ${report.text}`);
  try {
    await logReportToNotion(report);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to log report to Notion:', err);
  }
}

async function main() {
  if (!GROUP_ID) {
    // eslint-disable-next-line no-console
    console.log(
      'VANTAGE_WHATSAPP_GROUP_ID is not set yet — bot will only print group IDs it sees.\n' +
        'Send any message in the Vantage India WhatsApp group after scanning the QR, then copy the printed ID into .env.local.'
    );
  }

  const sock = await startWhatsAppBot({
    groupId: GROUP_ID,
    onGroupMessage,
  });

  if (!GROUP_ID) {
    sock.ev.on('connection.update', async (update) => {
      if (update.connection === 'open') {
        // small delay to ensure group metadata is synced
        setTimeout(async () => {
          try {
            const groups = await listJoinedGroups();
            // eslint-disable-next-line no-console
            console.log('\n=== JOINED GROUPS ===');
            for (const g of groups) {
              // eslint-disable-next-line no-console
              console.log(`${g.id}  |  ${g.subject}`);
            }
            console.log('=== END OF LIST ===\n');
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('Failed to list groups:', err);
          }
        }, 2000);
      }
    });
  }

  if (GROUP_ID) {
    startMorningScheduler(GROUP_ID);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error starting WhatsApp bot:', err);
  process.exit(1);
});
