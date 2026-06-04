# JSONPlaceholder API Tests — Playwright + TypeScript

A focused API test suite built with **Playwright** and **TypeScript**, targeting the public REST API at [https://jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com). 

Schema validation is handled by **Zod**, and test data generation by **Faker.js**.

Includes a utility to save execution runtime data.

---

## Application Under Test (AUT)

**[https://jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com)**

JSONPlaceholder is a free, public fake REST API used for prototyping and testing. This suite targets the `/todos` resource and covers standard CRUD operations, edge cases, and mocked failure scenarios.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev/) | API test runner and HTTP request context |
| [TypeScript](https://www.typescriptlang.org/) | Strongly-typed test code |
| [Zod](https://zod.dev/) | Runtime schema validation of API responses |
| [Faker.js](https://fakerjs.dev/) | Dynamic, randomised test data generation |

---

## Project Structure

```
.
├── api/
│   ├── schemas.ts          # Zod schemas and inferred types
│   └── todo.client.ts      # HTTP client wrapper for /todos endpoints
├── factories/
│   └── todo.factory.ts     # Factory functions for generating test payloads
├── tests/
│   ├── todos.spec.ts           # Main CRUD test suite
│   ├── todos-edge-cases.spec.ts  # Boundary and invalid input tests
│   └── todos-mock.spec.ts      # Mocked network response tests
├── types/
│   └── todo.types.ts       # Plain TypeScript interfaces and utility types
├── utils/
│   └── save-artifact.ts    # Utility for persisting response bodies to disk
├── runtime-artifacts/      # Auto-generated test output (committed to source control)
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## Installation

Node.js 18 or later is required.

```bash
# Install dependencies
npm install

# Install Playwright browsers (needed for the mock tests that use page context)
npx playwright install
```

---

## Running the Tests

```bash
# Run the full test suite
npm test
```

---

## Opening the HTML Report

After a test run, Playwright generates an HTML report. Open it with:

```bash
npm run test:report
```

This runs `playwright show-report` and opens the report in your default browser. The report includes pass/fail status, request/response details, and error traces for each test.

---

## `/api` Directory

### `schemas.ts`

Defines the **Zod schemas** used for runtime validation of API response bodies. This is the single source of truth for what a valid `Todo` object looks like.

```ts
// TodoSchema validates a full todo resource returned by the API
export const TodoSchema = z.strictObject({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    completed: z.boolean(),
});

// CreateTodoSchema is derived from TodoSchema, omitting the server-assigned `id`
export const CreateTodoSchema = TodoSchema.omit({ id: true });
```

`z.strictObject` is used intentionally — it rejects any response that contains unexpected extra fields, making the validation strict rather than permissive. The inferred TypeScript types (`Todo`, `CreateTodoInput`) are exported directly from the schemas, keeping the type definitions and validation in sync at all times.

---

### `todo.client.ts`

A **thin HTTP client wrapper** around Playwright's `APIRequestContext`. It encapsulates all `fetch`-level details so that test files never call `request.get(...)` directly — they always go through `TodoClient`.

Methods exposed:

| Method | HTTP | Endpoint |
|---|---|---|
| `getAll(userId?)` | GET | `/todos` (optional `?userId=` filter) |
| `getById(id)` | GET | `/todos/:id` |
| `create(todo)` | POST | `/todos` |
| `update(id, todo)` | PUT | `/todos/:id` |
| `partialUpdate(id, partial)` | PATCH | `/todos/:id` |
| `delete(id)` | DELETE | `/todos/:id` |

Each method returns a raw `APIResponse`, giving tests full control over status code assertions and body parsing. A new `TodoClient` instance is created in `beforeEach` using Playwright's injected `request` fixture, ensuring proper request context scoping per test.

---

## `/factories` Directory

### `todo.factory.ts`

Factory functions produce **realistic, randomised payloads** for test data using Faker.js. This avoids hardcoded values that can mask bugs or create brittle tests.

```ts
export function createTodoPayload(overrides?: Partial<CreateTodoPayload>): CreateTodoPayload {
    return {
        userId: faker.number.int({ min: 1, max: 10 }),
        title: faker.lorem.sentence({ min: 3, max: 7 }),
        completed: faker.datatype.boolean(),
        ...overrides
    };
}
```

The `overrides` parameter allows individual tests to pin specific values when the test logic requires them — for example, forcing `completed: true` when testing a PUT that must overwrite the completed state — while keeping all other fields dynamic.

---

## `/utils` Directory

### `save-artifact.ts`

A helper utility that persists API response bodies to disk during test execution. Selected tests call `saveArtifact(name, body)` after a successful response to capture the actual data returned by the server.

Artifacts are written to the `runtime-artifacts/` directory at the project root, using the provided name as the filename (e.g. `get-all-todos.json`). This directory is committed to source control so that the captured responses are available for review alongside the test code — useful for debugging, documentation, and change detection.

Tests that use this utility:

- `GET /todos` → `runtime-artifacts/get-all-todos.json`
- `GET /todos/1` → `runtime-artifacts/get-single-todo-id-1.json`
- `POST /todos` → `runtime-artifacts/create-todo-success.json`
- `PUT /todos/1` → `runtime-artifacts/update-todo-id-1-success.json`

---

## `/types` Directory

### `todo.types.ts`

Contains plain **TypeScript interfaces** that are used across the project independently of the Zod schemas. While `schemas.ts` exports inferred types tied to Zod validators, `todo.types.ts` defines the same shapes as simple interfaces — used in the factory and anywhere Zod is not involved.

```ts
export interface Todo {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}

export type CreateTodoPayload = Omit<Todo, 'id'>;
```

`CreateTodoPayload` omits `id` because the `id` field is always assigned server-side and should never be part of a creation request body.

---

## Test Suites Overview

### `todos.spec.ts` — Core CRUD Operations

The main suite covering the full lifecycle of the `/todos` resource: listing all todos, filtering by `userId`, fetching a single resource, creating, fully replacing, partially updating, and deleting a todo. All responses are validated against `TodoSchema` using Zod's `safeParse`.

### `todos-edge-cases.spec.ts` — Boundary and Invalid Input

Tests that probe the API's behaviour with invalid or incomplete input: empty payloads on POST, non-existent `userId` filters, and PUT requests with missing required fields. Several tests include documented notes about known backend validation gaps (e.g. the server accepts an empty POST body and returns 201 instead of 400).

### `todos-mock.spec.ts` — Mocked Network Scenarios

Uses Playwright's `page.route()` to intercept network requests at the browser level and return controlled responses. This allows testing client-side handling of server failures (403 Forbidden, 500 Internal Server Error) without relying on the actual server to produce those conditions.

---

## Notes on Known API Limitations

JSONPlaceholder is a read-only fake API — write operations (POST, PUT, PATCH, DELETE) are simulated and do not persist changes. This is expected behaviour and is accounted for in the test design. Some edge-case tests document genuine validation gaps in the API (e.g. missing field validation on PUT) with inline comments explaining the expected vs actual behaviour.