import { test, expect } from '@playwright/test';


/**
 * @fileoverview Mock test suite for the `/todos` API endpoint.
 * Intercepts network requests within the browser context to simulate 
 * server failures and edge-case responses.
 */


test.describe('Todos API Mocked Scenarios', () => {

	test('GET /todos/:id - Handle 403 Forbidden Access', async ({ page, baseURL }) => {

		await page.route('**/todos/1', async (route) => {
			await route.fulfill({
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Access Denied' }),
			});
		});

		// Use the baseURL fixture to construct the full URL
		const response = await page.evaluate(async (url) => {
			const res = await fetch(url);
			return {
				status: res.status,
				body: await res.json()
			};
		}, `${baseURL}/todos/1`);

		expect(response.status).toBe(403);
		expect(response.body.error).toBe('Access Denied');

	});

	test('GET /todos - Handle 500 Internal Server Error', async ({ page, baseURL }) => {

		await page.route('**/todos', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Internal Server Error' }),
			});
		});

		const response = await page.evaluate(async (url) => {
			const res = await fetch(url);
			return { status: res.status };
		}, `${baseURL}/todos`);

		expect(response.status).toBe(500);

	});

});
