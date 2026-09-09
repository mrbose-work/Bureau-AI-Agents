// End-of-day sweep: any active staff member with no check-in logged that
// day gets a "No check-in recorded" row, so HR can see gaps without any
// message being posted to the group.
import { getStaffDirectory, getAttendanceForDate, upsertAttendanceEntry } from './notion';

export async function runAttendanceSweep(dateKey: string) {
  const staff = await getStaffDirectory();
  const activeStaff = staff.filter((s) => s.employeeStatus === 'Active');
  const namesWithAttendance = new Set(await getAttendanceForDate(dateKey));

  let flagged = 0;
  for (const person of activeStaff) {
    if (namesWithAttendance.has(person.fullName)) continue;
    await upsertAttendanceEntry({
      staffName: person.fullName,
      phone: person.phone ?? '',
      dateKey,
      status: 'No check-in recorded',
    });
    flagged++;
  }

  // eslint-disable-next-line no-console
  console.log(`[attendance sweep] ${dateKey}: ${flagged} staff with no check-in recorded.`);
}
