// @core
/**
 * Kanban Core Service - Newton CRM
 * Business-critical service for pipeline and stage management
 *
 * This file re-exports from modular service files for backwards compatibility
 * API Base: https://crm.inewton.ai/api/v1/kanban
 */

// Re-export config functions
export {
  getKanbanConfig,
  createKanbanConfig,
  updateKanbanConfig,
  createDefaultConfig,
} from "./kanban.config.service";

// Re-export stage functions
export {
  getStages,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
  getDefaultStage,
  reorderStages,
} from "./kanban.stages.service";

// Re-export board functions
export {
  getBoard,
  validateTransition,
  moveLeadToStage,
} from "./kanban.board.service";
