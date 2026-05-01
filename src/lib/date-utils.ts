import { format, isToday, isYesterday } from "date-fns";

/**
 * Format date for display in the date rail
 */
export function formatDateForRail(date: Date) {
  return {
    day: format(date, "d"),
    month: format(date, "MMM"),
    dayOfWeek: format(date, "EEE"),
    year: format(date, "yyyy"),
    fullDay: format(date, "EEEE"),
  };
}

/**
 * Get label for date (Today, Yesterday, or day of week)
 */
export function getDateLabel(date: Date): string | undefined {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return undefined;
}

/**
 * Format full date for display (e.g., "Tuesday, April 21, 2026")
 */
export function formatFullDate(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

/**
 * Format date for calendar display
 */
export function formatCalendarDate(date: Date) {
  return {
    day: format(date, "d"),
    month: format(date, "MMM"),
    year: format(date, "yyyy"),
  };
}
