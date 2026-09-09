// 9:30am Mon-Sat digest scheduler. No cron dependency — just checks the
// clock every minute while the bot process is running. Only fires while
// your PC/Benjamin is on, as agreed (no 24/7 requirement for now).
import { buildMorningDigest } from './digest';
import { sendGroupMessage } from './whatsapp';
import { runAttendanceSweep } from './attendanceSweep';

const REMINDER_HOUR = 9;
const REMINDER_MINUTE = 30;
const SWEEP_HOUR = 20; // 8pm — well after 6pm checkout, silent, no group message
const SWEEP_MINUTE = 0;
const ABSENTEEISM_SWEEP_ENABLED = false; // on hold per Mr. Bose — revisit later
const WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon-Sat (0 = Sunday)

export function startMorningScheduler(groupId: string) {
  let lastDigestDateKey: string | null = null;
  let lastSweepDateKey: string | null = null;

  setInterval(async () => {
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10);
    const isWorkingDay = WORKING_DAYS.includes(now.getDay());

    const isDigestTime = now.getHours() === REMINDER_HOUR && now.getMinutes() === REMINDER_MINUTE;
    if (isWorkingDay && isDigestTime && lastDigestDateKey !== dateKey) {
      lastDigestDateKey = dateKey;
      try {
        const digest = await buildMorningDigest();
        await sendGroupMessage(groupId, digest.text);
        // eslint-disable-next-line no-console
        console.log(`✅ Sent morning digest (${digest.taskCount} tasks, ${digest.ownerCount} owners).`);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to send morning digest:', err);
      }
    }

    const isSweepTime = now.getHours() === SWEEP_HOUR && now.getMinutes() === SWEEP_MINUTE;
    if (ABSENTEEISM_SWEEP_ENABLED && isWorkingDay && isSweepTime && lastSweepDateKey !== dateKey) {
      lastSweepDateKey = dateKey;
      try {
        await runAttendanceSweep(dateKey);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to run attendance sweep:', err);
      }
    }
  }, 30_000); // check every 30s — cheap, no external calls until fire time

  // eslint-disable-next-line no-console
  console.log(
    `⏰ Morning digest armed for ${REMINDER_HOUR}:${REMINDER_MINUTE} Mon-Sat.` +
      (ABSENTEEISM_SWEEP_ENABLED
        ? ` Attendance sweep armed for ${SWEEP_HOUR}:${SWEEP_MINUTE}.`
        : ' Absenteeism sweep is on hold.')
  );
}
