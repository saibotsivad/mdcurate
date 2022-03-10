#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import sade from 'sade'
import polka from 'polka'

sade('mdcurate', true)
	.version(JSON.parse(readFileSync('./package.json', 'utf8')).version)
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
