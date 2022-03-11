import { reloadEverything } from '$lib/server/database.js'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import lodash from 'lodash'
import yaml from 'js-yaml'
import { parseFileString } from '$lib/server/file-manager.js'

const dangerouslyTransformMetadata = async (filepath, dangerouslyRun) => {
	const originalString = await readFile(filepath, 'utf8')
	let { metadata, blocks, errors } = parseFileString(originalString)
	if (errors) return errors.map(e => e._filepath = filepath)
	try {
		metadata = dangerouslyRun(metadata)
	} catch (error) {
		return [ { message: 'Error when running function.', _filepath: filepath, error } ]
	}
	let updatedString = [
		'---',
		yaml
			.dump(metadata, {
				schema: yaml.JSON_SCHEMA, quotingType: '"',
				lineWidth: -1,
			})
			.trim(),
		'---',
	].join('\n')
	// TODO whether to output as blockdown or not should come from the configuration file
	if (blocks.length !== 1) return [ { message: 'more than one blockdown content area', _filepath: filepath } ]
	updatedString += '\n' + blocks[0].content
	await writeFile(filepath, updatedString, 'utf8')
}

const initializeTheDanger = runnable => {
	const runner = new Function('$metadata', '_', `${runnable}; return $metadata`)
	return metadata => runner(metadata, lodash)
}

export async function post({ request }) {
	const { runnable, files } = await request.json()
	const dangerouslyRun = initializeTheDanger(runnable)
	const overallErrors = []
	for (const { folder, file } of files) {
		const errors = await dangerouslyTransformMetadata(join(folder, file), dangerouslyRun)
		if (errors) overallErrors.push(...errors)
	}
	await reloadEverything()
	return {
		status: 200,
		body: {
			ok: overallErrors.length > 0,
			errors: overallErrors,
		},
	}
}
