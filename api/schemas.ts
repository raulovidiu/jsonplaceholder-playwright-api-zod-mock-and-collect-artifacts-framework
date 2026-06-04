import { z } from 'zod';

export const TodoSchema = z.strictObject({
	userId: z.number(),
	id: z.number(),
	title: z.string(),
	completed: z.boolean(),
});

export const CreateTodoSchema = TodoSchema.omit({ id: true });

export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
