/**
 * Kanban Debug Utilities
 * Helper functions to debug kanban issues in browser console
 */

import { get } from "svelte/store";
import { authStore } from "$lib/stores/auth.store";
import { kanbanStore } from "$lib/stores/kanban.core.store";

/**
 * Test all kanban endpoints and log results
 */
export async function testKanbanAPI() {
  console.log("🔍 Starting Kanban API Test...");

  const authState = get(authStore);

  if (!authState.isAuthenticated) {
    console.error("❌ Not authenticated. Please login first.");
    return;
  }

  console.log("✅ User authenticated");

  try {
    // Call test endpoint
    const response = await fetch("/api/kanban/test", {
      headers: {
        Authorization: `Bearer ${authState.token}`,
      },
    });

    const result = await response.json();

    console.log("📊 Test Results:", result);

    if (result.success) {
      console.log("✅ All endpoints working!");
    } else {
      console.warn("⚠️ Some endpoints failed. Check test results above.");
    }

    // Analyze board data
    const boardTest = result.tests?.find((t: any) => t.endpoint === "board");
    if (boardTest?.analysis) {
      console.log("📋 Board Analysis:", boardTest.analysis);

      if (boardTest.analysis.totalLeads === 0) {
        console.warn(
          "⚠️ No leads found in the board. This could be why the pipeline appears empty.",
        );
      }

      if (boardTest.analysis.stageIds?.length > 0) {
        console.log("📌 Stage IDs from backend:", boardTest.analysis.stageIds);
      }
    }

    return result;
  } catch (error) {
    console.error("❌ Test failed:", error);
    return null;
  }
}

/**
 * Check kanban store state
 */
export function checkKanbanState() {
  const state = get(kanbanStore);

  console.log("🏪 Kanban Store State:", {
    isLoading: state.isLoading,
    hasConfig: !!state.config,
    stageCount: state.stages.length,
    stages: state.stages.map((s) => ({
      id: s.id,
      name: s.name,
      visible: s.is_visible,
    })),
    hasBoardData: !!state.boardData,
    boardStages: state.boardData ? Object.keys(state.boardData.stages) : [],
    lastUpdate: state.lastUpdate
      ? new Date(state.lastUpdate).toISOString()
      : "never",
    error: state.error,
  });

  if (state.boardData) {
    const stages = Object.keys(state.boardData.stages);
    stages.forEach((stageId) => {
      const leads = state.boardData!.stages[stageId];
      console.log(`  Stage "${stageId}": ${leads.length} leads`);
    });
  }

  return state;
}

/**
 * Check auth state
 */
export function checkAuthState() {
  const state = get(authStore);
  const tenantInfo = (state as typeof state & { currentTenant?: unknown })
    .currentTenant ?? null;

  console.log("🔐 Auth Store State:", {
    isAuthenticated: state.isAuthenticated,
    hasToken: !!state.token,
    user: state.user,
    currentTenant: tenantInfo,
    availableTenants: state.availableTenants,
  });

  return state;
}

/**
 * Full diagnostic check
 */
export async function runFullDiagnostic() {
  console.log("🔧 Running Full Kanban Diagnostic...");
  console.log("=====================================");

  // 1. Check auth
  console.log("\n1️⃣ Checking Authentication...");
  const authState = checkAuthState();

  if (!authState.isAuthenticated) {
    console.error("❌ Not authenticated. Please login first.");
    return;
  }

  // 2. Check kanban state
  console.log("\n2️⃣ Checking Kanban Store...");
  const kanbanState = checkKanbanState();

  // 3. Test API endpoints
  console.log("\n3️⃣ Testing API Endpoints...");
  const apiTest = await testKanbanAPI();

  // 4. Compare stage IDs
  console.log("\n4️⃣ Comparing Stage IDs...");
  if (kanbanState.stages.length > 0 && apiTest?.tests) {
    const configStages = kanbanState.stages.map((s) => s.id);
    const boardTest = apiTest.tests.find((t: any) => t.endpoint === "board");
    const boardStages = boardTest?.analysis?.stageIds || [];

    console.log("Config stages:", configStages);
    console.log("Board stages:", boardStages);

    const missingInBoard = configStages.filter(
      (id) => !boardStages.includes(id),
    );
    const missingInConfig = boardStages.filter(
      (id: string) => !configStages.includes(id),
    );

    if (missingInBoard.length > 0) {
      console.warn("⚠️ Stages in config but not in board:", missingInBoard);
    }
    if (missingInConfig.length > 0) {
      console.warn("⚠️ Stages in board but not in config:", missingInConfig);
    }
    if (missingInBoard.length === 0 && missingInConfig.length === 0) {
      console.log("✅ Stage IDs match perfectly!");
    }
  }

  // 5. Summary
  console.log("\n5️⃣ Diagnostic Summary:");
  console.log("=====================================");

  const issues = [];

  if (!authState.isAuthenticated) issues.push("Not authenticated");
  if (kanbanState.stages.length === 0) issues.push("No stages configured");
  if (!kanbanState.boardData) issues.push("No board data loaded");
  if (kanbanState.error) issues.push(`Store error: ${kanbanState.error}`);
  if (apiTest && !apiTest.success) issues.push("API endpoints failing");

  if (issues.length === 0) {
    console.log("✅ Everything looks good!");
  } else {
    console.warn("⚠️ Issues found:");
    issues.forEach((issue) => console.warn(`  - ${issue}`));
  }

  return {
    auth: authState,
    kanban: kanbanState,
    api: apiTest,
    issues,
  };
}

// Export to window for easy console access
if (typeof window !== "undefined") {
  (window as any).kanbanDebug = {
    test: testKanbanAPI,
    checkStore: checkKanbanState,
    checkAuth: checkAuthState,
    diagnose: runFullDiagnostic,
  };

  console.log("💡 Kanban debug tools loaded. Available commands:");
  console.log("  kanbanDebug.test()       - Test API endpoints");
  console.log("  kanbanDebug.checkStore() - Check kanban store state");
  console.log("  kanbanDebug.checkAuth()  - Check auth state");
  console.log("  kanbanDebug.diagnose()   - Run full diagnostic");
}
