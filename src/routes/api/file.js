import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function post({ request }) {
	const { action, folder, file, contents } = await request.json()
	if (action === 'read') {
		return {
			status: 200,
			body: { contents: await readFile(join(folder, file), 'utf8') },
		}
	}
	if (action === 'write') {
		await writeFile(join(folder, file), contents, 'utf8')
		return {
			status: 200,
		}
	}
}
