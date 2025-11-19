import { writable, derived } from "svelte/store";
import { getBoard } from "$lib/services/kanban-proxy.service";
import type { Stage } from "$lib/types/kanban";

export type DateFilter = "2days" | "3days" | "1week" | "all" | "custom";

interface StageStatsState {
    counts: Record<string, number>;
    isLoading: boolean;
    error: string | null;
    activeFilter: DateFilter;
    customRange: { start: Date | null; end: Date | null };
    lastUpdated: number;
}

const initialState: StageStatsState = {
    counts: {},
    isLoading: false,
    error: null,
    activeFilter: "all",
    customRange: { start: null, end: null },
    lastUpdated: 0
};

function createStageStatsStore() {
    const { subscribe, update, set } = writable<StageStatsState>(initialState);

    return {
        subscribe,

        setFilter: (filter: DateFilter) => {
            update(s => ({ ...s, activeFilter: filter }));
        },

        setCustomRange: (start: Date | null, end: Date | null) => {
            update(s => ({ ...s, customRange: { start, end }, activeFilter: "custom" }));
        },

        loadStats: async (token: string, filter: DateFilter, customRange?: { start: Date | null; end: Date | null }) => {
            update(s => ({
                ...s,
                isLoading: true,
                error: null,
                activeFilter: filter,
                customRange: customRange || s.customRange
            }));

            try {
                console.log("[STAGE STATS] Loading stats with filter:", filter);

                let daysLimit: number | undefined;
                let startDate: string | undefined;
                let endDate: string | undefined;
                const now = new Date();
                const msPerDay = 24 * 60 * 60 * 1000;

                if (filter === "2days") daysLimit = 2;
                if (filter === "3days") daysLimit = 3;
                if (filter === "1week") daysLimit = 7;

                if (daysLimit) {
                    const date = new Date(now.getTime() - daysLimit * msPerDay);
                    startDate = date.toISOString().split('T')[0];
                } else if (filter === "custom" && customRange) {
                    if (customRange.start) startDate = customRange.start.toISOString().split('T')[0];
                    if (customRange.end) endDate = customRange.end.toISOString().split('T')[0];
                }

                // Try server-side filtering first
                const params: any = {};
                if (daysLimit) params.days = daysLimit;
                if (startDate) params.start_date = startDate;
                if (endDate) params.end_date = endDate;

                const boardData = await getBoard(token, Object.keys(params).length > 0 ? params : undefined);

                const counts: Record<string, number> = {};

                Object.entries(boardData.stages).forEach(([stageId, leads]) => {
                    if (filter === "all") {
                        counts[stageId] = leads.length;
                    } else {
                        // Client-side filtering fallback
                        const filteredLeads = leads.filter(lead => {
                            if (!lead.last_interaction) return false;
                            const interactionDate = new Date(lead.last_interaction);

                            if (filter === "custom" && customRange) {
                                let inRange = true;
                                if (customRange.start && interactionDate < customRange.start) inRange = false;
                                if (customRange.end) {
                                    // Set end date to end of day
                                    const endOfDay = new Date(customRange.end);
                                    endOfDay.setHours(23, 59, 59, 999);
                                    if (interactionDate > endOfDay) inRange = false;
                                }
                                return inRange;
                            } else {
                                const diffTime = Math.abs(now.getTime() - interactionDate.getTime());
                                const diffDays = Math.ceil(diffTime / msPerDay);
                                return diffDays <= (daysLimit || 9999);
                            }
                        });
                        counts[stageId] = filteredLeads.length;
                    }
                });

                update(s => ({
                    ...s,
                    counts,
                    isLoading: false,
                    lastUpdated: Date.now()
                }));

            } catch (error) {
                console.error("[STAGE STATS] Error loading stats:", error);
                update(s => ({
                    ...s,
                    isLoading: false,
                    error: error instanceof Error ? error.message : "Error loading stats"
                }));
            }
        },

        reset: () => set(initialState)
    };
}

export const stageStatsStore = createStageStatsStore();
