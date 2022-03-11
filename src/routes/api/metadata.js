import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import split from 'just-split'
import yaml from 'js-yaml'

import { reloadEverything } from '$lib/server/database.js'
import { parseFileString } from '$lib/server/file-manager.js'

const process = async (filepath, modifyMetadata) => {
	const originalString = await readFile(filepath, 'utf8')
	const { metadata, blocks, errors } = parseFileString(originalString)
	if (errors) return errors.map(e => e._filepath = filepath)
	const updatedMetadata = modifyMetadata({ metadata, blocks })
	let updatedString = [
		'---',
		yaml.dump(updatedMetadata, { schema: yaml.JSON_SCHEMA, quotingType: '"' }).trim(),
		'---',
	].join('\n')
	// TODO whether to output as blockdown or not should come from the configuration file
	if (blocks.length !== 1) return [ { message: 'more than one blockdown content area', _filepath: filepath } ]
	updatedString += '\n' + blocks[0].content
	await writeFile(filepath, updatedString, 'utf8')
}

const renameMetadataKey = async (filepath, original, updated) => process(filepath, ({ metadata }) => {
	metadata[updated] = metadata[original]
	delete metadata[original]
	return metadata
})

const removeMetadataKey = async (filepath, key) => process(filepath, ({ metadata }) => {
	delete metadata[key]
	return metadata
})

const fileMapToFiles = fileMap => Object
	.keys(fileMap)
	.reduce((list, folder) => {
		for (const file in fileMap[folder]) list.push({ folder, file })
		return list
	}, [])

const actionFun = {
	rename: async ({ original, updated, fileMap }) => {
		const files = fileMapToFiles(fileMap)
		const start = Date.now()
		console.log(`Renaming metadata key in ${files.length} files from "${original}" to "${updated}".`)
		const chunks = split(files, 25)
		const totalErrors = []
		for (const chunk of chunks) {
			const out = await Promise.all(chunk.map(({ file, folder }) => renameMetadataKey(join(folder, file), original, updated)))
			for (const errors of out) {
				if (errors) totalErrors.push(...errors)
			}
		}
		await reloadEverything()
		console.log(`Done renaming keys after ${Date.now() - start}ms`)
		return {
			ok: totalErrors.length === 0,
			errors: totalErrors.length ? totalErrors : undefined,
		}
	},
	remove: async ({ key, fileMap }) => {
		const files = fileMapToFiles(fileMap)
		const start = Date.now()
		console.log(`Removing metadata key "${key}" from ${files.length} files.`)
		const chunks = split(files, 25)
		const totalErrors = []
		for (const chunk of chunks) {
			const out = await Promise.all(chunk.map(({ file, folder }) => removeMetadataKey(join(folder, file), key)))
			for (const errors of out) {
				if (errors) totalErrors.push(...errors)
			}
		}
		await reloadEverything()
		console.log(`Done removing keys after ${Date.now() - start}ms`)
		return {
			ok: totalErrors.length === 0,
			errors: totalErrors.length ? totalErrors : undefined,
		}
	},
}

export async function post({ request }) {
	const { action, params } = await request.json()
	if (!actionFun[action]) return { status: 400 }
	return {
		status: 200,
		body: await actionFun[action](params),
	}
}
