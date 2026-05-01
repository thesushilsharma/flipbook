import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  getAllDates,
  getJournalContent,
  getJournalEntry,
  saveJournalText,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  initializeDefaultData,
} from "@/lib/db";
import { useEffect, useState } from "react";

/**
 * Hook to get all dates with live updates
 */
export function useDates() {
  const dates = useLiveQuery(async () => {
    await initializeDefaultData();
    return await getAllDates();
  }, []);

  return dates || [];
}

/**
 * Hook to get journal content by ID with live updates
 */
export function useJournalContent(id: string) {
  const content = useLiveQuery(async () => await getJournalContent(id), [id]);

  return content;
}

/**
 * Hook to get full journal entry with live updates
 */
export function useJournalEntry(id: string) {
  const entry = useLiveQuery(async () => await getJournalEntry(id), [id]);

  return entry;
}

/**
 * Hook to get all journal entries with live updates
 */
export function useAllJournalEntries() {
  const entries = useLiveQuery(async () => {
    await initializeDefaultData();
    return await db.journalEntries.orderBy("date").reverse().toArray();
  }, []);

  return entries || [];
}

/**
 * Hook with actions for managing journal entries
 */
export function useJournalActions() {
  return {
    saveText: saveJournalText,
    createEntry: createJournalEntry,
    updateEntry: updateJournalEntry,
    deleteEntry: deleteJournalEntry,
  };
}

/**
 * Hook to initialize database on mount
 */
export function useInitializeDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeDefaultData()
      .then(() => setIsInitialized(true))
      .catch((error) => {
        console.error("Failed to initialize database:", error);
        setIsInitialized(false);
      });
  }, []);

  return isInitialized;
}

/**
 * Combined hook for easy access to dates and content
 */
export function useJournalData(activeId: string) {
  const dates = useDates();
  const content = useJournalContent(activeId);
  const entry = useJournalEntry(activeId);
  const actions = useJournalActions();

  return {
    dates,
    content,
    entry,
    actions,
  };
}
