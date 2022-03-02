import { getFolderFiles } from '$lib/server/database.js'

export async function get() {
	return {
		status: 200,
		body: getFolderFiles(),
	}
}
