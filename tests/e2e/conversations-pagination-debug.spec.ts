import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils/auth';

test.describe('Conversations pagination - Debug', () => {
	test('capture all pagination events', async ({ page }) => {
		if (!process.env.PLAYWRIGHT_ADMIN_EMAIL || !process.env.PLAYWRIGHT_ADMIN_PASSWORD) {
			test.skip();
		}

		const logs: string[] = [];
		const networkRequests: Array<{ url: string; timestamp: number }> = [];
		
		page.on('console', (message) => {
			const text = message.text();
			logs.push(text);
		});

		page.on('request', (request) => {
			const url = request.url();
			if (url.includes('/conversations/inbox')) {
				networkRequests.push({ url, timestamp: Date.now() });
				console.log('REQUEST:', url);
			}
		});

		await loginAsAdmin(page);
		console.log('Navigating to /conversaciones');
		await page.goto('/conversaciones');

		await page.waitForTimeout(5000);

		console.log('CONSOLE LOGS:', logs.length);
		logs.forEach(log => console.log(log));

		console.log('NETWORK REQUESTS:', networkRequests.length);
		networkRequests.forEach((req, idx) => {
			console.log(idx + 1, req.url);
		});

		const page1Requests = networkRequests.filter(r => r.url.includes('page=1'));
		const page2Requests = networkRequests.filter(r => r.url.includes('page=2'));

		console.log('Page 1 requests:', page1Requests.length);
		console.log('Page 2 requests:', page2Requests.length);

		await page.waitForSelector('[data-testid=conversations-list]', { timeout: 10000 });
		const conversationItems = await page.locator('[data-testid=conversation-item]').count();
		console.log('Visible conversations:', conversationItems);

		console.log('Attempting scroll...');
		await page.evaluate(() => {
			const scrollContainer = document.querySelector('[data-testid=conversations-scroll]');
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		});

		await page.waitForTimeout(3000);

		console.log('FINAL LOGS:');
		logs.slice(-10).forEach(log => console.log(log));
	});
});
