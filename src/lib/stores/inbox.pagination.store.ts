/**
 * Inbox Pagination Store - Newton CRM
 * Centralizes pagination metadata for the conversations list
 */

import { derived, writable } from "svelte/store";

const DEFAULT_PAGE_SIZE = 20;

export const currentPage = writable(1);
export const pageSize = writable(DEFAULT_PAGE_SIZE);
export const totalPages = writable(1);
export const totalConversations = writable(0);
export const isPageLoading = writable(false);

export const hasMore = derived(
  [currentPage, totalPages],
  ([$currentPage, $totalPages]) => $currentPage < Math.max(1, $totalPages),
);

export const paginationMeta = derived(
  [currentPage, pageSize, totalPages, totalConversations],
  ([$currentPage, $pageSize, $totalPages, $totalConversations]) => ({
    page: $currentPage,
    pageSize: $pageSize,
    pages: Math.max(1, $totalPages),
    total: Math.max(0, $totalConversations),
  }),
);

export const paginationSummary = derived([paginationMeta], ([$meta]) => {
  const total = $meta.total;
  const from =
    total === 0 ? 0 : Math.min(($meta.page - 1) * $meta.pageSize + 1, total);
  const to = total === 0 ? 0 : Math.min(total, $meta.page * $meta.pageSize);

  return {
    ...$meta,
    from,
    to,
    hasPrevious: $meta.page > 1,
    hasNext: $meta.page < $meta.pages,
  };
});

export function applyPaginationMeta(meta: {
  page?: number;
  pages?: number;
  total?: number;
  limit?: number;
}) {
  if (typeof meta.limit === "number" && meta.limit > 0) {
    pageSize.set(meta.limit);
  }
  if (typeof meta.page === "number" && meta.page > 0) {
    currentPage.set(meta.page);
  }
  if (typeof meta.pages === "number" && meta.pages > 0) {
    totalPages.set(meta.pages);
  }
  if (typeof meta.total === "number" && meta.total >= 0) {
    totalConversations.set(meta.total);
  }
}

export function resetPagination(limit: number = DEFAULT_PAGE_SIZE) {
  currentPage.set(1);
  pageSize.set(limit);
  totalPages.set(1);
  totalConversations.set(0);
  isPageLoading.set(false);
}
