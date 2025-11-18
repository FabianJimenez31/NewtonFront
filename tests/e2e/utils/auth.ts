import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const email = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const preferredTenantId = process.env.PLAYWRIGHT_TENANT_ID;

if (!email || !password) {
	console.warn(
		'[E2E] Missing PLAYWRIGHT_ADMIN_EMAIL or PLAYWRIGHT_ADMIN_PASSWORD. Auth-dependent tests will be skipped.'
	);
}

async function fetchAccessToken(page: Page) {
	const request = page.context().request;

	const loginResponse = await request.post('https://crm.inewton.ai/api/v1/auth/login-multi-tenant', {
		data: { email, password }
	});
	if (!loginResponse.ok()) {
		throw new Error(`login-multi-tenant failed: ${loginResponse.status()} ${loginResponse.statusText()}`);
	}

	const loginData = await loginResponse.json();
	const tempToken: string = loginData.temp_token;
	const tenants: Array<{ tenant_id: string }> = loginData.tenants ?? [];
	const tenantId = preferredTenantId ?? tenants[0]?.tenant_id;
	if (!tenantId) {
		throw new Error('No tenant_id available for admin credentials');
	}

	const selectResponse = await request.post('https://crm.inewton.ai/api/v1/auth/select-tenant', {
		data: { tenant_id: tenantId },
		headers: { Authorization: `Bearer ${tempToken}` }
	});
	if (!selectResponse.ok()) {
		throw new Error(`select-tenant failed: ${selectResponse.status()} ${selectResponse.statusText()}`);
	}

	const { access_token, user } = await selectResponse.json();
	return { access_token, user };
}

export async function loginAsAdmin(page: Page) {
	if (!email || !password) {
		throw new Error(
			'PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD must be set to run auth E2E tests.'
		);
	}

	const { access_token, user } = await fetchAccessToken(page);

	// Persist auth data before any app scripts execute
	await page.addInitScript(
		([token, userJson]) => {
			localStorage.setItem('auth_token', token);
			localStorage.setItem('auth_user', userJson);

			const expires = new Date();
			expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
			document.cookie = `auth_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
		},
		[access_token, JSON.stringify(user)]
	);

	await page.goto('/pipeline');
	await expect(page).toHaveURL(/\/pipeline/);
}
