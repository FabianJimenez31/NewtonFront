import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const skipTest = () => {
	if (typeof process !== 'undefined') {
		return !process.env.PLAYWRIGHT_ADMIN_EMAIL || !process.env.PLAYWRIGHT_ADMIN_PASSWORD;
	}
	return true;
};

test.describe('Conversations inbox pagination', () => {
	test('initial page should load before requesting page 2', async ({ page }) => {
		test.skip(
			skipTest(),
			'Requires PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD env vars'
		);

		const logs: string[] = [];
		page.on('console', (message) => {
			const text = message.text();
			if (text.includes('[INBOX]') || text.includes('[PAGINATION]') || text.includes('[SCROLL]')) {
				logs.push(text);
			}
		});

		await loginAsAdmin(page);
		await page.goto('/conversaciones');

		// Wait for initial page to load
		await expect
			.poll(
				() => logs.some((entry) => entry.includes('[INBOX] Initial page loaded')),
				{ timeout: 15000 }
			)
			.toBe(true);

		// Verify that viewport fill completed before any user interaction
		await expect
			.poll(
				() => logs.some((entry) => entry.includes('[INBOX] Viewport fill complete')),
				{ timeout: 15000 }
			)
			.toBe(true);

		// Check order of events: Initial load should come before page 2
		const initialIndex = logs.findIndex((entry) =>
			entry.includes('[INBOX] Initial page loaded')
		);
		const viewportFillIndex = logs.findIndex((entry) =>
			entry.includes('[INBOX] Viewport fill complete')
		);

		expect(initialIndex, 'Initial load log must appear').not.toBe(-1);
		expect(viewportFillIndex, 'Viewport fill log must appear').not.toBe(-1);
		expect(initialIndex, 'Page 1 should load before viewport fill').toBeLessThan(
			viewportFillIndex
		);

		// Log all captured events for debugging
		console.log('Captured logs:', logs);
	});

	test('pagination should advance when scrolling to bottom', async ({ page }) => {
		test.skip(
			skipTest(),
			'Requires PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD env vars'
		);

		const logs: string[] = [];
		page.on('console', (message) => {
			const text = message.text();
			if (text.includes('[INBOX]') || text.includes('[PAGINATION]') || text.includes('[SCROLL]')) {
				logs.push(text);
			}
		});

		await loginAsAdmin(page);
		await page.goto('/conversaciones');

		// Wait for initial load
		await page.waitForSelector('[data-testid=conversations-list]', { timeout: 10000 });

		// Get initial conversation count
		const initialCount = await page
			.locator('[data-testid=conversation-item]')
			.count();

		// Scroll to bottom
		await page.evaluate(() => {
			const scrollContainer = document.querySelector('[data-testid=conversations-scroll]');
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		});

		// Wait for new conversations to load
		await page.waitForTimeout(2000);

		// Get new conversation count
		const newCount = await page
			.locator('[data-testid=conversation-item]')
			.count();

		// Verify more conversations were loaded
		expect(newCount, 'More conversations should be loaded after scrolling').toBeGreaterThan(
			initialCount
		);

		// Verify scroll handler was triggered (not during initialization)
		const scrollTriggers = logs.filter((entry) =>
			entry.includes('[SCROLL] Triggering loadMore')
		);
		expect(scrollTriggers.length, 'Scroll handler should have triggered').toBeGreaterThan(0);
	});
});
