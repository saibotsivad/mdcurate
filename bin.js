#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import sade from 'sade'
import { server } from './src/index.js'

sade('metadata-organizer', true)
	.version(JSON.parse(readFileSync('./package.json', 'utf8')).version)
	.describe('Launch the metadata organizer website so you can curate your markdown frontmatter.')
	.option('--port, -p', 'Set the port to run the server on.', 3000)
	.action(async ({ port }) => {
		await server({ port })
	})
	.parse(process.argv)
