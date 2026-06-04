import * as fs from 'fs/promises';
import * as path from 'path';

const BASE_ARTIFACTS_DIR = path.join(process.cwd(), 'runtime-artifacts');

// Generate a single timestamp for the current test execution run
// Format: YYYY-MM-DDTHH-mm-ss-SSSZ (safe for folder names)
const EXECUTION_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// This creates a dedicated path like: runtime-artifacts/2026-06-03T22-31-00-123Z
const currentRunDir = path.join(BASE_ARTIFACTS_DIR, EXECUTION_TIMESTAMP);

/**
 * Saves runtime test data into an execution-specific folder inside the runtime-artifacts directory.
 * @param actionName - Description of the operation (e.g., 'get-all-todos', 'created-todo')
 * @param data - The actual payload or response object to save
 */
export async function saveArtifact(actionName: string, data: any): Promise<void> {
	try {
		// Ensure the specific execution folder exists
		await fs.mkdir(currentRunDir, { recursive: true });

		// Since files are already isolated inside a timestamped folder, 
		// we can keep the file name clean and descriptive.
		const fileName = `${actionName}.json`;
		const filePath = path.join(currentRunDir, fileName);

		// Format the payload structure
		const payload = {
			action: actionName,
			timestamp: new Date().toISOString(),
			payload: data
		};

		// Async write to disk
		await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
		console.log(`Artifact successfully saved to: ${filePath}`);
	} catch (error) {
		console.error(`Failed to save test artifact for action "${actionName}":`, error);
	}
}
