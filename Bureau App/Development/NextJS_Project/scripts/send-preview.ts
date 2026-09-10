// Reusable: send a draft message to Mr. Bose's personal WhatsApp for preview,
// before it goes to the actual Vantage India group.
// Usage: npx tsx scripts/send-preview.ts "message text here"
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { startWhatsAppBot, sendDirectMessage } from '../src/lib/vantageIndia/whatsapp';

const PERSONAL_NUMBER = '9330568258';
const message = process.argv[2];

if (!message) {
  console.error('Usage: npx tsx scripts/send-preview.ts "message text"');
  process.exit(1);
}

async function main() {
  await startWhatsAppBot({});
  await new Promise((r) => setTimeout(r, 3000));
  await sendDirectMessage(PERSONAL_NUMBER, message);
  console.log('SENT to personal number for preview.');
  await new Promise((r) => setTimeout(r, 4000));
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
