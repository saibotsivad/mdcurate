import { readdir } from 'node:fs/promises'
import { sep, join, isAbsolute } from 'node:path'

export async function post({ request }) {
	const { dirParts } = await request.json()
	let path = join(...dirParts.map(d => d.toString()))
	if (!isAbsolute(path)) path = sep + path
	const dirs = await readdir(path, { withFileTypes: true })
	return {
		status: 200,
		body: dirs
			.filter(d => d.isDirectory())
			.map(d => d.name)
			.filter(d => !d.startsWith('.')),
	}
}
