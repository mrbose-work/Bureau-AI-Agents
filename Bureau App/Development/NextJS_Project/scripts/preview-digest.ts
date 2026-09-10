import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { buildMorningDigest } from '../src/lib/vantageIndia/digest';

buildMorningDigest().then((d) => {
  console.log(d.text);
  console.log(`\n---\n${d.taskCount} tasks, ${d.ownerCount} owners`);
  process.exit(0);
});
