// Builds today's digest and sends it directly to the Vantage India group
// (used after Mr. Bose has approved the personal-number preview).
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { buildMorningDigest } from '../src/lib/vantageIndia/digest';
import { startWhatsAppBot, sendGroupMessage } from '../src/lib/vantageIndia/whatsapp';

const GROUP_ID = process.env.VANTAGE_WHATSAPP_GROUP_ID!;

async function main() {
  const digest = await buildMorningDigest();
  await startWhatsAppBot({ groupId: GROUP_ID });
  await new Promise((r) => setTimeout(r, 3000));
  await sendGroupMessage(GROUP_ID, digest.text);
  console.log('SENT digest to Vantage India group.');
  await new Promise((r) => setTimeout(r, 4000));
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
