export interface Todo {
	userId: number,
	id: number,
	title: string,
	completed: boolean,
}

export type CreateTodoPayload = Omit<Todo, 'id'>;
