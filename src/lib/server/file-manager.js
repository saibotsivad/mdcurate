import path from 'node:path'
import fs from 'node:fs/promises'
import glob from 'tiny-glob'
import split from 'just-split'
import { parse as parseBlockdown } from '@saibotsivad/blockdown'
import yaml from 'js-yaml'

export const parseFileString = string => {
	let errors
	let warnings
	const blockdown = parseBlockdown(string)
	if (blockdown.warnings) warnings = blockdown.warnings
	let [ frontmatter, ...blocks ] = blockdown.blocks || []
	let metadata
	if (frontmatter.name === 'frontmatter') {
		try {
			metadata = yaml.load(frontmatter.content, { schema: yaml.JSON_SCHEMA })
		} catch (error) {
			errors = [ error ]
		}
	} else {
		blocks = [ frontmatter, ...blocks ]
	}
	return { metadata, blocks, errors, warnings }
}

export const loadAllFiles = async (folder, extensions) => {
	let files = await glob(`**/*.{${extensions.join(',')}}`, { cwd: folder })
	const output = {}
	for (const chunk of split(files, 25)) {
		const loadedFiles = await Promise.all(chunk.map(
			filename => fs.readFile(path.join(folder, filename), 'utf8').then(string => ({ filename, ...parseFileString(string) })),
		))
		for (const { filename, ...data } of loadedFiles) {
			output[filename] = data
		}
	}
	return output
}
