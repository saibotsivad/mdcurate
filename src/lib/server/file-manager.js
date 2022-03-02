import path from 'node:path'
import fs from 'node:fs/promises'
import glob from 'tiny-glob'
import split from 'just-split'
import { parse as parseBlockdown } from '@saibotsivad/blockdown'
import yaml from 'js-yaml'

const parseFileString = string => {
	let errors
	let warnings
	const blockdown = parseBlockdown(string)
	if (blockdown.warnings) warnings = blockdown.warnings
	const [ frontmatter, ...blocks ] = blockdown.blocks || []
	let metadata
	try {
		metadata = yaml.load(frontmatter.content)
	} catch (error) {
		errors = [ error ]
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
