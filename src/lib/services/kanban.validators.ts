/**
 * Kanban Validators - Newton CRM
 * Validation utilities for kanban/stage data
 */

import type { StageCreate, StageUpdate, Stage } from "$lib/types/kanban";
import { getStages } from "./kanban.core.service";

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Validate stage data before submission
 */
export function validateStageData(stage: StageCreate | StageUpdate): string[] {
  const errors: string[] = [];

  if ("name" in stage) {
    if (!stage.name || stage.name.length < 3 || stage.name.length > 50) {
      errors.push("El nombre debe tener entre 3 y 50 caracteres");
    }
  }

  if ("color" in stage && stage.color) {
    if (!isValidHexColor(stage.color)) {
      errors.push("El color debe estar en formato hexadecimal (#RRGGBB)");
    }
  }

  if ("order" in stage && stage.order !== undefined) {
    if (stage.order < 0 || !Number.isInteger(stage.order)) {
      errors.push("El orden debe ser un número entero mayor o igual a 0");
    }
  }

  if ("auto_score" in stage && stage.auto_score !== undefined) {
    if (stage.auto_score < 0 || stage.auto_score > 100) {
      errors.push("El puntaje automático debe estar entre 0 y 100");
    }
  }

  return errors;
}

/**
 * Check if stage name is unique within tenant
 * Utility function for form validation
 */
export async function isStageNameUnique(
  token: string,
  name: string,
  excludeStageId?: string,
): Promise<boolean> {
  try {
    const stages = await getStages(token);
    return !stages.some(
      (stage) => stage.name === name && stage.id !== excludeStageId,
    );
  } catch (error) {
    return false;
  }
}

/**
 * Check if stage color is unique (optional validation)
 */
export function isColorUnique(
  stages: Stage[],
  color: string,
  excludeStageId?: string,
): boolean {
  return !stages.some(
    (stage) => stage.color === color && stage.id !== excludeStageId,
  );
}

/**
 * Validate stage order is unique
 */
export function isOrderUnique(
  stages: Stage[],
  order: number,
  excludeStageId?: string,
): boolean {
  return !stages.some(
    (stage) => stage.order === order && stage.id !== excludeStageId,
  );
}

/**
 * Get next available order number
 */
export function getNextOrder(stages: Stage[]): number {
  if (stages.length === 0) return 0;
  const maxOrder = Math.max(...stages.map((s) => s.order));
  return maxOrder + 1;
}
