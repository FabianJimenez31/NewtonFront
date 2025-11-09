/**
 * API Proxy - Select Tenant
 * Proxies requests to avoid CORS issues
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE = 'https://crm.inewton.ai/api/v1/auth';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const authHeader = request.headers.get('authorization');

		if (!authHeader) {
			return json({ detail: 'Authorization header required' }, { status: 401 });
		}

		const response = await fetch(`${API_BASE}/select-tenant`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authHeader
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();

		if (!response.ok) {
			return json(data, { status: response.status });
		}

		return json(data);
	} catch (error) {
		console.error('Proxy error:', error);
		return json(
			{ detail: 'Error connecting to authentication service' },
			{ status: 500 }
		);
	}
};
