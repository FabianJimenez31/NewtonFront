/**
 * Infinite Scroll Composable - Newton CRM
 * Handles infinite scroll logic for paginated lists
 */

import { onDestroy } from "svelte";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  // SVELTE 5 FIX: Use getter functions to capture reactive values
  isLoading: () => boolean;
  hasMore: () => boolean;
  isInitializing: () => boolean;
  itemsCount: () => number;
  threshold?: number;
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const {
    onLoadMore,
    isLoading,
    hasMore,
    isInitializing,
    itemsCount,
    threshold = 100,
  } = options;

  /**
   * Scroll handler for detecting when user reaches bottom
   */
  function handleScroll(event: Event) {
    // Get current reactive values by calling the getters
    const _isLoading = isLoading();
    const _hasMore = hasMore();
    const _isInitializing = isInitializing();
    const _itemsCount = itemsCount();

    // Guards: don't trigger if loading, no more data, or initializing
    if (!onLoadMore || !_hasMore || _isLoading || _isInitializing) {
      console.log("[INFINITE-SCROLL] Blocked:", {
        hasCallback: !!onLoadMore,
        hasMore: _hasMore,
        isLoading: _isLoading,
        isInitializing: _isInitializing,
        itemsCount: _itemsCount,
      });
      return;
    }

    // Guard: don't trigger if no items loaded yet
    if (_itemsCount === 0) {
      console.log("[INFINITE-SCROLL] No items loaded yet");
      return;
    }

    const target = event.target as HTMLElement;
    if (!target) return;

    const { scrollTop, scrollHeight, clientHeight } = target;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    // Trigger load more when within threshold pixels from bottom
    if (distanceToBottom < threshold) {
      console.log("[INFINITE-SCROLL] Threshold reached, triggering loadMore", {
        distanceToBottom,
        threshold,
        itemsCount: _itemsCount,
      });
      onLoadMore();
    }
  }

  return {
    handleScroll,
  };
}
