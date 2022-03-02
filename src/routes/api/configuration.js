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
		if (op === 'add' && path === '/folders') {
			addFolder(value)
		} else if (op === 'remove' && path.startsWith('/folders/')) {
			const [ , folder ] = toTokens(path)
			console.log('------------removing folder', folder)
			removeFolder(folder)
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
	console.log('Configuration updated.', getConfiguration())
	return {
		status: 200,
		body: getConfiguration(),
	}
}
