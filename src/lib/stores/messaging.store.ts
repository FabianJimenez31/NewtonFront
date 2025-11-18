/**
 * Messaging Store - Newton CRM
 * Svelte store for managing messaging and conversation details
 * Refactored to split state and actions
 */

import * as actions from "./messaging.actions";

// Re-export all state
export * from "./messaging.state";

// Export actions object for backward compatibility
export const messagingActions = {
  ...actions,
};
