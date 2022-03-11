#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sade from 'sade'
import polka from 'polka'

const __dirname = dirname(fileURLToPath(import.meta.url))

sade('mdcurate', true)
	.version(JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')).version)
	.describe('Launch the metadata organizer website so you can curate your markdown frontmatter.')
	.option('--port, -p', 'Set the port to run the server on.', 3000)
	.action(async ({ port }) => {
		process.env.HOST = '127.0.0.1'
		process.env.PORT = port
		process.env.ORIGIN = process.env.ORIGIN || `http://localhost:${port}`
		import('./dist/handler.js').then(({ handler }) => {
			const server = polka()
			server.use(handler)
			server.listen(parseInt(port, 10), () => {
				console.log('Metadata Organizer is ready! Access it here:', `http://localhost:${port}`)
			})
		})
	})
	.parse(process.argv)
