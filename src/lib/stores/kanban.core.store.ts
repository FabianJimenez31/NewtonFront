// @core
/**
 * Kanban Core Store - Newton CRM
 * Business-critical state management for pipeline and stages
 */

import { writable, derived } from "svelte/store";
import type {
  KanbanConfig,
  Stage,
  BoardData,
  StageCreate,
  StageUpdate,
  KanbanFilters,
} from "$lib/types/kanban";
import * as kanbanService from "$lib/services/kanban-proxy.service";

interface KanbanState {
  config: KanbanConfig | null;
  stages: Stage[];
  boardData: BoardData | null;
  isLoading: boolean;
  isLoadingBoard: boolean;
  error: string | null;
  filters: KanbanFilters;
  lastUpdate: number | null;
}

const initialState: KanbanState = {
  config: null,
  stages: [],
  boardData: null,
  isLoading: false,
  isLoadingBoard: false,
  error: null,
  filters: {},
  lastUpdate: null,
};

function createKanbanStore() {
  const { subscribe, set, update } = writable<KanbanState>(initialState);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  return {
    subscribe,

    loadConfig: async (token: string) => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const [config, stages] = await Promise.all([
          kanbanService.getKanbanConfig(token),
          kanbanService.getStages(token),
        ]);
        update((s) => ({
          ...s,
          config,
          stages: stages.sort((a, b) => a.order - b.order),
          isLoading: false,
          lastUpdate: Date.now(),
        }));
        return { config, stages };
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : "Error al cargar configuración";
        update((s) => ({ ...s, isLoading: false, error: msg }));
        throw error;
      }
    },

    loadBoard: async (token: string, filters?: KanbanFilters) => {
      update((s) => ({
        ...s,
        isLoadingBoard: true,
        error: null,
        filters: filters || s.filters,
      }));
      try {
        const boardData = await kanbanService.getBoard(token, filters);
        update((s) => ({
          ...s,
          boardData,
          isLoadingBoard: false,
          lastUpdate: Date.now(),
        }));
        return boardData;
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Error al cargar tablero";
        update((s) => ({ ...s, isLoadingBoard: false, error: msg }));
        throw error;
      }
    },

    refreshBoard: async (token: string) => {
      try {
        const boardData = await kanbanService.getBoard(token);
        update((s) => ({ ...s, boardData, lastUpdate: Date.now() }));
        return boardData;
      } catch (error) {
        console.error("Failed to refresh board:", error);
        throw error;
      }
    },

    createStage: async (token: string, stage: StageCreate) => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const newStage = await kanbanService.createStage(token, stage);
        update((s) => ({
          ...s,
          stages: [...s.stages, newStage].sort((a, b) => a.order - b.order),
          isLoading: false,
        }));
        return newStage;
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Error al crear etapa";
        update((s) => ({ ...s, isLoading: false, error: msg }));
        throw error;
      }
    },

    updateStage: async (token: string, stageId: string, stage: StageUpdate) => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const updatedStage = await kanbanService.updateStage(
          token,
          stageId,
          stage,
        );
        update((s) => ({
          ...s,
          stages: s.stages
            .map((st) => (st.id === stageId ? updatedStage : st))
            .sort((a, b) => a.order - b.order),
          isLoading: false,
        }));
        return updatedStage;
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Error al actualizar etapa";
        update((s) => ({ ...s, isLoading: false, error: msg }));
        throw error;
      }
    },

    deleteStage: async (token: string, stageId: string) => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        await kanbanService.deleteStage(token, stageId);
        update((s) => ({
          ...s,
          stages: s.stages.filter((st) => st.id !== stageId),
          isLoading: false,
        }));
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Error al eliminar etapa";
        update((s) => ({ ...s, isLoading: false, error: msg }));
        throw error;
      }
    },

    createDefaultConfig: async (token: string) => {
      update((s) => ({ ...s, isLoading: true, error: null }));
      try {
        const config = await kanbanService.createDefaultConfig(token);
        const stages = await kanbanService.getStages(token);
        update((s) => ({
          ...s,
          config,
          stages: stages.sort((a, b) => a.order - b.order),
          isLoading: false,
        }));
        return config;
      } catch (error) {
        const msg =
          error instanceof Error
            ? error.message
            : "Error al crear configuración por defecto";
        update((s) => ({ ...s, isLoading: false, error: msg }));
        throw error;
      }
    },

    moveLeadToStage: async (
      token: string,
      leadId: string,
      toStage: string,
      notes?: string,
    ) => {
      try {
        await kanbanService.moveLeadToStage(token, leadId, {
          stage: toStage,
          notes,
        });
        const boardData = await kanbanService.getBoard(token);
        update((s) => ({ ...s, boardData, lastUpdate: Date.now() }));
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Error al mover lead";
        throw new Error(msg);
      }
    },

    startAutoRefresh: (token: string, intervalMs: number = 30000) => {
      if (refreshInterval) clearInterval(refreshInterval);
      refreshInterval = setInterval(() => {
        kanbanService.getBoard(token).then((boardData) => {
          update((s) => ({ ...s, boardData, lastUpdate: Date.now() }));
        });
      }, intervalMs);
    },

    stopAutoRefresh: () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    },

    setError: (error: string) => {
      update((s) => ({ ...s, error, isLoading: false, isLoadingBoard: false }));
    },

    clearError: () => update((s) => ({ ...s, error: null })),

    reset: () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
      set(initialState);
    },
  };
}

export const kanbanStore = createKanbanStore();

export const sortedStages = derived(kanbanStore, ($k) =>
  $k.stages.sort((a, b) => a.order - b.order),
);
export const activeStages = derived(sortedStages, ($s) =>
  $s.filter((st) => st.is_active),
);
export const visibleStages = derived(activeStages, ($s) =>
  $s.filter((st) => st.is_visible),
);
