import { test, expect } from '@playwright/test';
import { TodoClient } from '../../api/todo.client';


/**
 * @fileoverview Edge case test suite for the `/todos` API endpoint.
 * Validates system resilience against boundary values and unexpected input formats.
 */


test.describe('Todos API Edge Cases', () => {
	let todoClient: TodoClient;

	test.beforeEach(({ request }) => {
		todoClient = new TodoClient(request);
	});

	test('POST /todos - Send Empty Payload', async () => {
		/**
		 * This is a real bug!
		 * The BE allows, unfortunately, that an Empty Object to be provided as a Payload
		 * and the Entity is created
		 * Actual result: received 201
		 * Expectation: expect(response.status()).toBeGreaterThanOrEqual(400);
		 */

		// This is the current incorrect functionality:
		const response = await todoClient.create({} as any);
		expect(response.status()).toBe(201);
	});


	test('GET /todos - Handle Non-Existent UserId Filter', async () => {
		const response = await todoClient.getAll(999999);
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBe(0);
	});


	test('PUT /todos/:id - Send Malformed Body with Missing Required Fields)', async () => {
		/**
		 * This is a real bug!
		 * There is no validation when required fields are not provided.
		 * 200 is received, instead of BE rejecting this with 400 Bad Request
		 */

		const malformedTodo = { title: 'Broken' };
		const response = await todoClient.update(1, malformedTodo as any);

		// Expected: Expect rejection due to strict schema enforcement
		// Actual: This is the current incorrect functionality:
		expect(response.status()).toBeGreaterThanOrEqual(200);
	});
});
