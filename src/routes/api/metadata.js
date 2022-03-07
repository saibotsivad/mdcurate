import timers from 'node:timers/promises'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import split from 'just-split'
import yaml from 'js-yaml'

import { markFolderForReload, getConfiguration } from '$lib/server/database.js'
import { parseFileString } from '$lib/server/file-manager.js'

const renameMetadataKey = async (filepath, original, updated) => {
	const originalString = await readFile(filepath, 'utf8')
	const { metadata, blocks, errors } = parseFileString(originalString)
	if (errors) return errors.map(e => e._filepath = filepath)
	metadata[updated] = metadata[original]
	delete metadata[original]
	let updatedString = [
		'---',
		yaml.dump(metadata, { schema: yaml.JSON_SCHEMA, quotingType: '"' }).trim(),
		'---',
	].join('\n')
	// TODO this is specific to BB, but whether to output as blockdown or not should come from the configuration file
	if (blocks.length !== 1) return [ { message: 'more than one blockdown content area', _filepath: filepath } ]
	updatedString += '\n' + blocks[0].content
	await writeFile(filepath, updatedString, 'utf8')
}

const actionFun = {
	rename: async ({ original, updated, files }) => {
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
		const folders = {}
		for (const { folder } of files) {
			folders[folder] = true
			markFolderForReload(folder)
		}
		while (Object.keys(folders).length) {
			await timers.setTimeout(1000)
			console.log('checking...')
			const configuration = getConfiguration()
			for (const folder of Object.keys(configuration.folders)) {
				if (configuration.folders[folder].status !== 'loading') delete folders[folder]
			}
		}
		console.log(`Done renaming keys after ${Date.now() - start}ms`)
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
