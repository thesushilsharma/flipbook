/**
 * Utility to reset the database
 * Use this in the browser console to reset the database with correct order
 */

import { clearAllData, initializeDefaultData } from "./db";

export async function resetDatabase() {
  try {
    console.log("Clearing database...");
    await clearAllData();
    
    console.log("Initializing with default data...");
    await initializeDefaultData();
    
    console.log("✅ Database reset complete! Refresh the page.");
    return true;
  } catch (error) {
    console.error("❌ Failed to reset database:", error);
    return false;
  }
}

// Make it available globally for easy console access
if (typeof window !== "undefined") {
  (window as any).resetDatabase = resetDatabase;
}
