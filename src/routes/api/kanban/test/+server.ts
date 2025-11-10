import { json, type RequestHandler } from "@sveltejs/kit";

/**
 * Test endpoint to verify connection with backend API
 * GET /api/kanban/test
 */
export const GET: RequestHandler = async ({ request }) => {
  console.log("[API TEST] Testing backend connection...");

  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    console.error("[API TEST] No authorization header");
    return json({ error: "No authorization token provided" }, { status: 401 });
  }

  console.log(
    "[API TEST] Auth header present:",
    authHeader.substring(0, 20) + "...",
  );

  try {
    // Test multiple endpoints to get a complete picture
    const tests = [];

    // 1. Test config endpoint
    const configUrl = "https://crm.inewton.ai/api/v1/kanban/";
    console.log("[API TEST] Testing config endpoint:", configUrl);

    const configResponse = await fetch(configUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    tests.push({
      endpoint: "config",
      url: configUrl,
      status: configResponse.status,
      ok: configResponse.ok,
      data: configResponse.ok
        ? await configResponse.json()
        : await configResponse.text(),
    });

    // 2. Test stages endpoint
    const stagesUrl = "https://crm.inewton.ai/api/v1/kanban/stages/";
    console.log("[API TEST] Testing stages endpoint:", stagesUrl);

    const stagesResponse = await fetch(stagesUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    tests.push({
      endpoint: "stages",
      url: stagesUrl,
      status: stagesResponse.status,
      ok: stagesResponse.ok,
      data: stagesResponse.ok
        ? await stagesResponse.json()
        : await stagesResponse.text(),
    });

    // 3. Test board endpoint
    const boardUrl = "https://crm.inewton.ai/api/v1/kanban/board";
    console.log("[API TEST] Testing board endpoint:", boardUrl);

    const boardResponse = await fetch(boardUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const boardData = boardResponse.ok
      ? await boardResponse.json()
      : await boardResponse.text();

    // If board data is successful, analyze it
    let boardAnalysis = null;
    if (boardResponse.ok && typeof boardData === "object" && boardData.stages) {
      const stageIds = Object.keys(boardData.stages);
      boardAnalysis = {
        hasStages: stageIds.length > 0,
        stageCount: stageIds.length,
        stageIds: stageIds,
        leadCounts: stageIds.reduce(
          (acc, stageId) => {
            acc[stageId] = boardData.stages[stageId]?.length || 0;
            return acc;
          },
          {} as Record<string, number>,
        ),
        totalLeads: stageIds.reduce(
          (sum, stageId) => sum + (boardData.stages[stageId]?.length || 0),
          0,
        ),
      };
    }

    tests.push({
      endpoint: "board",
      url: boardUrl,
      status: boardResponse.status,
      ok: boardResponse.ok,
      data: boardData,
      analysis: boardAnalysis,
    });

    // Summary
    const allOk = tests.every((test) => test.ok);
    const summary = {
      success: allOk,
      timestamp: new Date().toISOString(),
      tests: tests,
      message: allOk
        ? "All backend endpoints are reachable and responding correctly"
        : "Some endpoints failed - check individual test results",
    };

    console.log("[API TEST] Test results:", JSON.stringify(summary, null, 2));

    return json(summary, { status: allOk ? 200 : 207 });
  } catch (error) {
    console.error("[API TEST] Test failed:", error);
    return json(
      {
        error: "Failed to test backend connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
