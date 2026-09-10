// Builds today's digest and sends it to Mr. Bose's personal number for review.
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { buildMorningDigest } from '../src/lib/vantageIndia/digest';
import { startWhatsAppBot, sendDirectMessage } from '../src/lib/vantageIndia/whatsapp';

const PERSONAL_NUMBER = '9330568258';

async function main() {
  const digest = await buildMorningDigest();
  await startWhatsAppBot({});
  await new Promise((r) => setTimeout(r, 3000));
  await sendDirectMessage(PERSONAL_NUMBER, digest.text);
  console.log('SENT digest preview to personal number.');
  await new Promise((r) => setTimeout(r, 4000)); // let the message actually flush before closing the socket
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
