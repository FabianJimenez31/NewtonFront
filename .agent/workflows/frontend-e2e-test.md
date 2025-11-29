---
description: Run E2E tests to validate frontend changes
---

# Frontend E2E Testing Workflow

This workflow runs the end-to-end tests using Playwright to ensure that recent frontend changes have not broken core system functionality.

1.  **Run E2E Tests**
    Execute the Playwright test suite.
    ```bash
    npm run test:e2e
    ```

2.  **Check Results**
    -   If the tests pass, the changes are likely safe.
    -   If the tests fail, review the output to identify the broken components.
