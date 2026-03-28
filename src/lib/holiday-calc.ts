import {
  eachDayOfInterval,
  isWeekend,
  parseISO,
  format,
} from "date-fns";
import type { BankHoliday } from "@/types/database";

/**
 * Calculate working days between two dates, excluding weekends and bank holidays.
 * For part-time employees (days_per_week < 5), adjusts proportionally.
 */
export function calculateWorkingDays(
  startDate: string,
  endDate: string,
  bankHolidays: BankHoliday[],
  daysPerWeek: number = 5
): number {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (start > end) return 0;

  const bankHolidayDates = new Set(
    bankHolidays.map((bh) => bh.date)
  );

  const allDays = eachDayOfInterval({ start, end });
  const fullTimeWorkingDays = allDays.filter((day) => {
    if (isWeekend(day)) return false;
    const dateStr = format(day, "yyyy-MM-dd");
    if (bankHolidayDates.has(dateStr)) return false;
    return true;
  }).length;

  // Adjust for part-time
  if (daysPerWeek < 5) {
    return Math.round((fullTimeWorkingDays * daysPerWeek) / 5 * 2) / 2;
  }

  return fullTimeWorkingDays;
}

/**
 * Calculate hours for hourly employees.
 */
export function calculateWorkingHours(
  startDate: string,
  endDate: string,
  bankHolidays: BankHoliday[],
  hoursPerWeek: number,
  daysPerWeek: number
): number {
  const workingDays = calculateWorkingDays(startDate, endDate, bankHolidays, 5);
  const hoursPerDay = daysPerWeek > 0 ? hoursPerWeek / daysPerWeek : 0;
  return Math.round(workingDays * hoursPerDay * 2) / 2;
}

/**
 * Get bank holidays that fall within a date range.
 */
export function getBankHolidaysInRange(
  startDate: string,
  endDate: string,
  bankHolidays: BankHoliday[]
): BankHoliday[] {
  return bankHolidays.filter((bh) => {
    return bh.date >= startDate && bh.date <= endDate;
  });
}
