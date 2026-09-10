// Reusable: send an approved message to the Vantage India group.
// Usage: npx tsx scripts/send-to-group.ts "message text here"
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { startWhatsAppBot, sendGroupMessage } from '../src/lib/vantageIndia/whatsapp';

const GROUP_ID = process.env.VANTAGE_WHATSAPP_GROUP_ID!;
const message = process.argv[2];

if (!message) {
  console.error('Usage: npx tsx scripts/send-to-group.ts "message text"');
  process.exit(1);
}

async function main() {
  await startWhatsAppBot({ groupId: GROUP_ID });
  await new Promise((r) => setTimeout(r, 3000));
  await sendGroupMessage(GROUP_ID, message);
  console.log('SENT to Vantage India group.');
  await new Promise((r) => setTimeout(r, 4000));
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
