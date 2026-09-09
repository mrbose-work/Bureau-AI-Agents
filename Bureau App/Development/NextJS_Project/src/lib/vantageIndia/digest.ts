// Builds the daily 9:30am WhatsApp digest text from open Vantage India tasks.
import { getOpenTasks, VantageTask } from './notion';

export interface DigestResult {
  text: string;
  taskCount: number;
  ownerCount: number;
  generatedAt: string;
}

export async function buildMorningDigest(): Promise<DigestResult> {
  const tasks = await getOpenTasks();

  const byOwner = new Map<string, VantageTask[]>();
  for (const task of tasks) {
    const owners = task.ownerNames.length > 0 ? task.ownerNames : ['Unassigned'];
    for (const owner of owners) {
      if (!byOwner.has(owner)) byOwner.set(owner, []);
      byOwner.get(owner)!.push(task);
    }
  }

  const lines: string[] = [];
  lines.push('📋 *Vantage India — Daily Task Reminder*');
  lines.push('');

  const sortedOwners = [...byOwner.keys()].sort();
  for (const owner of sortedOwners) {
    const ownerTasks = byOwner.get(owner)!;
    lines.push(`*${owner}* (${ownerTasks.length} open)`);
    for (const t of ownerTasks) {
      const flags: string[] = [];
      if (t.status === 'In progress') flags.push('in progress');
      if (t.daysDelayed && t.daysDelayed > 0) flags.push(`⚠️ ${t.daysDelayed}d delayed`);
      if (t.dateEnd) flags.push(`due ${t.dateEnd}`);
      const flagStr = flags.length ? ` (${flags.join(', ')})` : '';
      lines.push(`  • ${t.name}${flagStr}`);
    }
    lines.push('');
  }

  if (tasks.length === 0) {
    lines.push('No open tasks — all clear today.');
  }

  return {
    text: lines.join('\n').trim(),
    taskCount: tasks.length,
    ownerCount: sortedOwners.length,
    generatedAt: new Date().toISOString(),
  };
}
