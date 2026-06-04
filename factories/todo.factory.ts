import { faker } from '@faker-js/faker';
import { CreateTodoPayload } from '../types/todo.types';

/**
 * Generates a dynamic payload for creating a Todo.
 * Allows partial overriding of properties if necessary.
 */
export function createTodoPayload(overrides?: Partial<CreateTodoPayload>): CreateTodoPayload {
	return {
		userId: faker.number.int({ min: 1, max: 10 }), // JSONPlaceholder has users from 1 to 10
		title: faker.lorem.sentence({ min: 3, max: 7 }), // Generates a dynamic title between 3 and 7 words
		completed: faker.datatype.boolean(), // Randomly returns true or false
		...overrides // Overrides the default values if specific parameters are provided
	};
}
