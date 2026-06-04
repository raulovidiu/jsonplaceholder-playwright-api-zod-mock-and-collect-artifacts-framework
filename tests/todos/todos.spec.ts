import { test, expect } from '@playwright/test';
import { TodoClient } from '../../api/todo.client';
import { TodoSchema } from '../../api/schemas';
import { z } from 'zod';
import { saveArtifact } from '../../utils/save-artifact';
import { createTodoPayload } from '../../factories/todo.factory';


/**
 * @fileoverview Test suite for the `/todos` API endpoint.
 * Validates all standard HTTP methods and their expected request/response behavior.
 */


test.describe('Todos API Operations', () => {

	let todoClient: TodoClient;

	test.beforeEach(({ request }) => {
		todoClient = new TodoClient(request);
	});

	test('GET /todos - Return a Valid List of Todos', async () => {
		const response = await todoClient.getAll();
		expect(response.status()).toBe(200);

		const body = await response.json();
		const ListSchema = z.array(TodoSchema);
		const parseResult = ListSchema.safeParse(body);

		expect(parseResult.success).toBe(true);
		expect(body.length).toBeGreaterThan(0);

		// Capture the retrieved list of todos
		await saveArtifact('get-all-todos', body);
	});


	test('GET /todos - Filter Correctly by UserId', async () => {
		const userIdFilter = 1;
		const response = await todoClient.getAll(userIdFilter);
		expect(response.status()).toBe(200);

		const body = await response.json();
		const parseResult = z.array(TodoSchema).safeParse(body);
		expect(parseResult.success).toBe(true);

		body.forEach((todo: any) => {
			expect(todo.userId).toBe(userIdFilter);
		});
	});


	test('GET /todos/:id - Return a Single Valid Todo', async () => {
		const response = await todoClient.getById(1);
		expect(response.status()).toBe(200);

		const body = await response.json();
		const parseResult = TodoSchema.safeParse(body);
		expect(parseResult.success).toBe(true);

		expect(body).toEqual({
			userId: 1,
			id: 1,
			title: 'delectus aut autem',
			completed: false,
		});

		// Capture the individual retrieved todo
		await saveArtifact('get-single-todo-id-1', body);
	});


	test('GET /todos/:id - Return 404 for a Inexistent id', async () => {
		const response = await todoClient.getById(9999);
		expect(response.status()).toBe(404);
	});


	test('POST /todos - Insert a New Todo', async () => {
		// Generate a completely dynamic payload using the factory function
		const payload = createTodoPayload();

		const response = await todoClient.create(payload);
		expect(response.status()).toBe(201);

		const body = await response.json();
		expect(TodoSchema.safeParse(body).success).toBe(true);
		expect(body).toMatchObject(payload);

		// Capture the newly created server response data
		await saveArtifact('create-todo-success', body);
	});


	test('PUT /todos/:id - Completely Overwrite a Todo', async () => {
		// Generate a dynamic payload but enforce a specific value required for the test
		const payload = createTodoPayload({ completed: true });

		const updatedTodo = {
			id: 1,
			...payload
		};

		const response = await todoClient.update(1, updatedTodo);
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(TodoSchema.safeParse(body).success).toBe(true);
		expect(body).toEqual(updatedTodo);

		// Capture the modified resource data
		await saveArtifact('update-todo-id-1-success', body);
	});


	test('PATCH /todos/:id - Partially Modify a Todo', async () => {
		const partialPayload = { completed: true };

		const response = await todoClient.partialUpdate(1, partialPayload);
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(TodoSchema.safeParse(body).success).toBe(true);
		expect(body.id).toBe(1);
		expect(body.completed).toBe(true);
	});


	test('DELETE /todos/:id - Delete the Resource', async () => {
		const response = await todoClient.delete(1);
		expect(response.status()).toBe(200);

		const body = await response.json();
		expect(body).toEqual({});
	});

});
