import { defineConfig } from '@playwright/test';

export default defineConfig({
	use: {
		baseURL: 'https://jsonplaceholder.typicode.com',
		extraHTTPHeaders: {
			'Content-type': 'application/json; charset=UTF-8',
		},
	},
	reporter: 'html',
});
