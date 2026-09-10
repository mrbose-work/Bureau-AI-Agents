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
      const cleanOwner = owner.trim();
      if (!byOwner.has(cleanOwner)) byOwner.set(cleanOwner, []);
      byOwner.get(cleanOwner)!.push(task);
    }
  }

  const lines: string[] = [];
  lines.push('🎩 Good morning, everyone. Benjamin here with today\'s standing of affairs — kindly find below what remains outstanding on each of your desks.');
  lines.push('');
  lines.push('📋 *Vantage India — Daily Task Reminder*');
  lines.push('');

  const sortedOwners = [...byOwner.keys()].sort();
  for (const owner of sortedOwners) {
    const ownerTasks = byOwner.get(owner)!;
    lines.push(`🧑‍💼 *${owner}* (${ownerTasks.length} open)`);
    ownerTasks.forEach((t, i) => {
      const flags: string[] = [];
      if (t.status === 'In progress') flags.push('🔄 in progress');
      if (t.daysDelayed && t.daysDelayed > 0) flags.push(`⚠️ ${t.daysDelayed}d delayed`);
      if (t.dateEnd) flags.push(`📅 due ${t.dateEnd}`);
      const flagStr = flags.length ? ` (${flags.join(', ')})` : '';
      lines.push(`${i + 1}. ${t.name}${flagStr}`);
    });
    lines.push('');
  }

  if (tasks.length === 0) {
    lines.push('✨ Nothing outstanding today — all clear.');
  } else {
    lines.push('Do let me know if anything above needs adjusting. Wishing everyone a productive day ahead ☕.');
    lines.push('');
    lines.push('— Benjamin');
  }

  return {
    text: lines.join('\n').trim(),
    taskCount: tasks.length,
    ownerCount: sortedOwners.length,
    generatedAt: new Date().toISOString(),
  };
}
