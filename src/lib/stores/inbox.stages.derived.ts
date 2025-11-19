/**
 * Stages with Counts - Derived Store
 * Calculates lead counts per stage for sidebar display
 */

import { derived, writable } from "svelte/store";
import { backendStageCounts } from "$lib/stores/inbox.store";
import { sortedStages } from "$lib/stores/kanban.core.store";
import type { Stage } from "$lib/types/kanban";

interface StageWithCount extends Stage {
  leadCount: number;
}

export type DateFilter = "2days" | "3days" | "1week" | "all";

// Date filter store
export const dateFilter = writable<DateFilter>("all");

/**
 * Convert DateFilter to API date parameters (YYYY-MM-DD format)
 */
export function dateFilterToParams(filter: DateFilter): {
  days?: number;
} {
  if (filter === "all") {
    return {}; // Clear date filters
  }

  const daysMap = {
    "2days": 2,
    "3days": 3,
    "1week": 7,
  };

  return {
    days: daysMap[filter],
  };
}

/**
 * Find stage count by matching stage name/id with backend keys
 * Tries exact match, normalized match (lowercase, replace spaces/hyphens)
 */
function findStageCount(
  stage: Stage,
  backendCounts: Record<string, number>,
): number {
  // Try exact match by name
  if (backendCounts[stage.name]) {
    return backendCounts[stage.name];
  }

  // Try exact match by id
  if (backendCounts[stage.id]) {
    return backendCounts[stage.id];
  }

  // Normalize and try fuzzy matching
  const normalize = (str: string) => str.toLowerCase().replace(/[\s-_]/g, "");
  const normalizedStageName = normalize(stage.name);
  const normalizedStageId = normalize(stage.id);

  for (const [key, count] of Object.entries(backendCounts)) {
    const normalizedKey = normalize(key);
    if (
      normalizedKey === normalizedStageName ||
      normalizedKey === normalizedStageId
    ) {
      return count;
    }
  }

  return 0;
}

/**
 * Derived store that enhances stages with lead counts from backend
 * Uses stage_counts returned by the API for accurate totals
 */
export const stagesWithCounts = derived(
  [sortedStages, backendStageCounts],
  ([$sortedStages, $backendStageCounts]) => {
    console.log("[STAGES WITH COUNTS] Backend counts:", $backendStageCounts);
    console.log(
      "[STAGES WITH COUNTS] Frontend stages:",
      $sortedStages.map((s) => s.name),
    );

    return $sortedStages.map((stage): StageWithCount => {
      const count = findStageCount(stage, $backendStageCounts);
      console.log(`[STAGES WITH COUNTS] Stage "${stage.name}" -> ${count}`);
      return {
        ...stage,
        leadCount: count,
      };
    });
  },
);
