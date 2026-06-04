import { APIRequestContext } from '@playwright/test';
import { Todo } from './schemas';

export class TodoClient {
	constructor(private request: APIRequestContext) { }

	async getAll(userId?: number) {
		return this.request.get('/todos', {
			params: userId ? { userId } : undefined,
		});
	}

	async getById(id: number) {
		return this.request.get(`/todos/${id}`);
	}

	async create(todo: Omit<Todo, 'id'>) {
		return this.request.post('/todos', { data: todo });
	}

	async update(id: number, todo: Todo) {
		return this.request.put(`/todos/${id}`, { data: todo });
	}

	async partialUpdate(id: number, partialTodo: Partial<Todo>) {
		return this.request.patch(`/todos/${id}`, { data: partialTodo });
	}

	async delete(id: number) {
		return this.request.delete(`/todos/${id}`);
	}
}
