#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import sade from 'sade'
import polka from 'polka'
import { post } from 'httpie'
import { toPointer } from 'pointer-props'

const __dirname = dirname(fileURLToPath(import.meta.url))

sade('mdcurate', true)
	.version(JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')).version)
	.describe('Launch the metadata organizer website so you can curate your markdown frontmatter.')
	.option('--port, -p', 'Set the port to run the server on.', 3000)
	.option('--here, -h', 'Start with the current directory already added. Optionally set extensions as a comma delimited list.')
	.example('# launch right away')
	.example('--here # start with current directory loaded using *.md extension')
	.example('--here=md,txt # start with current directory, but use *.md and *.txt')
	.action(async ({ port, here }) => {
		process.env.HOST = '127.0.0.1'
		process.env.PORT = port
		process.env.ORIGIN = process.env.ORIGIN || `http://localhost:${port}`
		import('./dist/handler.js').then(({ handler }) => {
			const server = polka()
			server.use(handler)
			server.listen(parseInt(port, 10), () => {
				const url = `http://localhost:${port}`
				const ready = () => console.log('Metadata Organizer is ready! Access it here:', url)
				if (here) {
					let extensions = []
					if (typeof here === 'string') extensions = here.split(',').map(ext => ext.trim())
					if (!extensions.length) extensions = [ 'md' ]
					post(`${url}/api/configuration`, {
						headers: { 'content-type': 'application/json' },
						body: [
							{
								op: 'add',
								path: toPointer([ 'folders', process.cwd() ]),
								value: { extensions },
							},
						],
					}).then(() => ready())
				} else {
					ready()
				}
			})
		})
	})
	.parse(process.argv)
