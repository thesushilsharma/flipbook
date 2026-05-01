import Dexie, { type EntityTable } from "dexie";
import { subDays, subWeeks, subMonths } from "date-fns";
import type { DateItem, JournalContent } from "@/types";

// Define the database schema
interface JournalEntry {
  id: string;
  date: Date;
  label?: string;
  content: JournalContent;
  userText?: string; // User's journal entry
  createdAt: Date;
  updatedAt: Date;
}

interface Divider {
  id: string;
  text: string;
  order: number;
}

// Create the database
class FlipBookDatabase extends Dexie {
  journalEntries!: EntityTable<JournalEntry, "id">;
  dividers!: EntityTable<Divider, "id">;

  constructor() {
    super("FlipBookDB");
    this.version(1).stores({
      journalEntries: "id, date, createdAt, updatedAt",
      dividers: "id, order",
    });
  }
}

export const db = new FlipBookDatabase();

// Initialize default data
export async function initializeDefaultData() {
  const count = await db.journalEntries.count();

  // Only initialize if database is empty
  if (count === 0) {
    const today = new Date();

    const defaultEntries: JournalEntry[] = [
      {
        id: "d1",
        date: today,
        label: "Today",
        content: {
          imageCaption: "Today's Sunshine",
          promptTitle: "Afternoon Reflection",
          promptText: "What made you smile today?",
          time: "02:00 PM",
          streak: "5 Day Streak",
          msg: "You are on a roll!",
        },
        createdAt: today,
        updatedAt: today,
      },
      {
        id: "d2",
        date: subDays(today, 1),
        label: "Yesterday",
        content: {
          imageCaption: "Quiet Night",
          promptTitle: "Evening Calm",
          promptText: "List 3 things you are grateful for today.",
          time: "09:00 PM",
          streak: "4 Day Streak",
          msg: "Keep up the good work!",
        },
        createdAt: subDays(today, 1),
        updatedAt: subDays(today, 1),
      },
      {
        id: "d3",
        date: subDays(today, 2),
        content: {
          imageCaption: "Spring Breeze",
          promptTitle: "Morning Energy",
          promptText:
            "Waking up with intention sets the tone\nfor a beautiful day ahead.",
          time: "09:00 AM",
          streak: "3 Day Streak",
          msg: "A fresh start awaits you today!",
        },
        createdAt: subDays(today, 2),
        updatedAt: subDays(today, 2),
      },
      {
        id: "d4",
        date: subDays(today, 3),
        content: {
          imageCaption: "Weekend Time",
          promptTitle: "Weekend Vibes",
          promptText: "How are you resting this weekend?",
          time: "11:00 AM",
          streak: "2 Day Streak",
          msg: "Time to recharge!",
        },
        createdAt: subDays(today, 3),
        updatedAt: subDays(today, 3),
      },
      {
        id: "d5",
        date: subDays(today, 4),
        content: {
          imageCaption: "Busy Work",
          promptTitle: "Focus Time",
          promptText: "What is your main goal for today?",
          time: "08:30 AM",
          streak: "1 Day Streak",
          msg: "Stay focused!",
        },
        createdAt: subDays(today, 4),
        updatedAt: subDays(today, 4),
      },
      {
        id: "d6",
        date: subWeeks(today, 1),
        content: {
          imageCaption: "Good Memories",
          promptTitle: "Looking Back",
          promptText: "What was the highlight of this year?",
          time: "07:00 PM",
          streak: "10 Day Streak",
          msg: "Incredible dedication!",
        },
        createdAt: subWeeks(today, 1),
        updatedAt: subWeeks(today, 1),
      },
      {
        id: "d7",
        date: subMonths(today, 1),
        content: {
          imageCaption: "Autumn Leaves",
          promptTitle: "Letting Go",
          promptText: "What is something you need to release?",
          time: "04:15 PM",
          streak: "7 Day Streak",
          msg: "One week strong!",
        },
        createdAt: subMonths(today, 1),
        updatedAt: subMonths(today, 1),
      },
    ];

    const defaultDividers: Divider[] = [
      { id: "y1", text: "Last Week", order: 5 },
      { id: "y2", text: "Last Month", order: 6 },
    ];

    await db.journalEntries.bulkAdd(defaultEntries);
    await db.dividers.bulkAdd(defaultDividers);
  }
}

// Get all dates with dividers in the correct order
export async function getAllDates(): Promise<DateItem[]> {
  const entries = await db.journalEntries.orderBy("date").toArray();
  return entries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    label: entry.label,
    isDivider: false,
  }));
}

// Get entries for a specific month
export async function getEntriesForMonth(
  year: number,
  month: number,
): Promise<JournalEntry[]> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  return await db.journalEntries
    .where("date")
    .between(startDate, endDate, true, true)
    .toArray();
}

// Get or create entry for a specific date
export async function getOrCreateEntryForDate(
  date: Date,
): Promise<JournalEntry> {
  const dateStr = date.toISOString().split("T")[0];
  const existingEntry = await db.journalEntries
    .where("date")
    .between(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
      true,
      true,
    )
    .first();

  if (existingEntry) {
    return existingEntry;
  }

  // Create a new entry for this date
  const newEntry: JournalEntry = {
    id: `entry-${dateStr}`,
    date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
    content: {
      imageCaption: "New Day",
      promptTitle: "Daily Reflection",
      promptText: "What's on your mind today?",
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      streak: "1 Day Streak",
      msg: "Start your journey!",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.journalEntries.add(newEntry);
  return newEntry;
}

// Get journal content by ID
export async function getJournalContent(
  id: string,
): Promise<JournalContent | null> {
  const entry = await db.journalEntries.get(id);
  return entry ? entry.content : null;
}

// Get full journal entry by ID
export async function getJournalEntry(
  id: string,
): Promise<JournalEntry | undefined> {
  return await db.journalEntries.get(id);
}

// Save user's journal text
export async function saveJournalText(id: string, text: string): Promise<void> {
  await db.journalEntries.update(id, {
    userText: text,
    updatedAt: new Date(),
  });
}

// Create a new journal entry
export async function createJournalEntry(
  entry: Omit<JournalEntry, "createdAt" | "updatedAt">,
): Promise<string> {
  const now = new Date();
  const newEntry: JournalEntry = {
    ...entry,
    createdAt: now,
    updatedAt: now,
  };
  return await db.journalEntries.add(newEntry);
}

// Update journal entry
export async function updateJournalEntry(
  id: string,
  updates: Partial<Omit<JournalEntry, "id" | "createdAt">>,
): Promise<void> {
  await db.journalEntries.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

// Delete journal entry
export async function deleteJournalEntry(id: string): Promise<void> {
  await db.journalEntries.delete(id);
}

// Get entries by date range
export async function getEntriesByDateRange(
  startDate: Date,
  endDate: Date,
): Promise<JournalEntry[]> {
  return await db.journalEntries
    .where("date")
    .between(startDate, endDate, true, true)
    .toArray();
}

// Search entries by text
export async function searchEntries(query: string): Promise<JournalEntry[]> {
  const allEntries = await db.journalEntries.toArray();
  return allEntries.filter(
    (entry) =>
      entry.userText?.toLowerCase().includes(query.toLowerCase()) ||
      entry.content.promptText.toLowerCase().includes(query.toLowerCase()) ||
      entry.content.promptTitle.toLowerCase().includes(query.toLowerCase()),
  );
}

// Export all data (for backup)
export async function exportAllData() {
  const entries = await db.journalEntries.toArray();
  const dividers = await db.dividers.toArray();
  return { entries, dividers };
}

// Import data (for restore)
export async function importData(data: {
  entries: JournalEntry[];
  dividers: Divider[];
}) {
  await db.transaction("rw", [db.journalEntries, db.dividers], async () => {
    await db.journalEntries.clear();
    await db.dividers.clear();
    await db.journalEntries.bulkAdd(data.entries);
    await db.dividers.bulkAdd(data.dividers);
  });
}

// Clear all data
export async function clearAllData(): Promise<void> {
  await db.transaction("rw", [db.journalEntries, db.dividers], async () => {
    await db.journalEntries.clear();
    await db.dividers.clear();
  });
}

// Export types
export type { JournalEntry, Divider };
