import { useState, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { getEntriesForMonth, getOrCreateEntryForDate } from "@/lib/db";

export function useCalendar(initialDate: Date = new Date()) {
  const [currentMonth, setCurrentMonth] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Get entries for the current month
  const entries = useLiveQuery(
    async () => {
      return await getEntriesForMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
      );
    },
    [currentMonth],
    [],
  );

  // Get all days in the current month view (including padding days)
  const calendarDays = useCallback(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Check if a date has an entry
  const hasEntry = useCallback(
    (date: Date) => {
      return entries?.some((entry) => isSameDay(entry.date, date)) || false;
    },
    [entries],
  );

  // Navigate to previous month
  const previousMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  // Navigate to next month
  const nextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  // Go to today
  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  }, []);

  // Select a specific date
  const selectDate = useCallback(async (date: Date) => {
    setSelectedDate(date);
    // Ensure entry exists for this date
    await getOrCreateEntryForDate(date);
  }, []);

  return {
    currentMonth,
    selectedDate,
    calendarDays: calendarDays(),
    entries: entries || [],
    hasEntry,
    previousMonth,
    nextMonth,
    goToToday,
    selectDate,
    monthLabel: format(currentMonth, "MMMM yyyy"),
  };
}
