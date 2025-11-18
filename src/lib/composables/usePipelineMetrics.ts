/**
 * Pipeline Metrics Composable
 * Calculates and formats pipeline statistics
 */

import type { BoardData } from "$lib/types/kanban";
import { formatCompactCurrency } from "$lib/utils/currency";

export interface PipelineMetrics {
  totalValue: number;
  totalLeads: number;
  totalUnread: number;
  mainCurrency: string;
  formattedValue: string;
}

/**
 * Calculate pipeline metrics from board data
 */
export function calculatePipelineMetrics(
  boardData: BoardData | null,
): PipelineMetrics {
  if (!boardData || !boardData.stages) {
    return {
      totalValue: 0,
      totalLeads: 0,
      totalUnread: 0,
      mainCurrency: "USD",
      formattedValue: "$0",
    };
  }

  const allLeads = Object.values(boardData.stages).flat();

  // Calculate total value
  const totalValue = allLeads.reduce(
    (sum, lead) => sum + (lead.deal_value || 0),
    0,
  );

  // Calculate total leads count
  const totalLeads = allLeads.length;

  // Calculate total unread count
  const totalUnread = allLeads.reduce(
    (sum, lead) => sum + (lead.unread_count || 0),
    0,
  );

  // Get predominant currency
  const currencies = allLeads.filter((l) => l.currency).map((l) => l.currency!);

  let mainCurrency = "USD";
  if (currencies.length > 0) {
    const counts = currencies.reduce(
      (acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    mainCurrency =
      Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "USD";
  }

  // Format currency
  const formattedValue = formatCompactCurrency(totalValue, mainCurrency);

  return {
    totalValue,
    totalLeads,
    totalUnread,
    mainCurrency,
    formattedValue,
  };
}
