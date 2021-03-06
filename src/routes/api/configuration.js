import { addFolder, removeFolder, getConfiguration } from '$lib/server/database.js'
import { toTokens } from 'pointer-props'

export async function get() {
	return {
		status: 200,
		body: getConfiguration(),
	}
}

export async function post({ request }) {
	const patches = await request.json()
	for (const { op, path, value } of patches) {
		if (op === 'add' && path.startsWith('/folders/')) {
			const [ , folder ] = toTokens(path)
			await addFolder(folder, value?.extensions)
		} else if (op === 'remove' && path.startsWith('/folders/')) {
			const [ , folder ] = toTokens(path)
			await removeFolder(folder)
		} else {
			return {
				status: 400,
				body: {
					error: 'Unsupported patch request.',
					patch: { op, path, value },
				},
			}
		}
	}
	return {
		status: 200,
		body: getConfiguration(),
	}
}
