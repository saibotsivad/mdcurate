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
	.option('--dir, -d', 'Start with a directory already added. If empty it will use the current directory.')
	.option('--ext, -e', 'When using the --dir flag, set the extension as a comma delimited string.', 'md')
	.example('# launch right away')
	.example('--dir # start with current directory loaded using *.md extension')
	.example('--dir /path/to/folder --ext md,txt # start with different directory and use *.md and *.txt')
	.action(async ({ port, dir, ext }) => {
		process.env.HOST = '127.0.0.1'
		process.env.PORT = port
		process.env.ORIGIN = process.env.ORIGIN || `http://localhost:${port}`
		import('./dist/handler.js').then(({ handler }) => {
			const server = polka()
			server.use(handler)
			server.listen(parseInt(port, 10), () => {
				const url = `http://localhost:${port}`
				const ready = () => console.log('Metadata Organizer is ready! Access it here:', url)
				if (dir && typeof dir !== 'string') dir = process.cwd()
				if (dir) {
					let extensions = []
					if (typeof ext === 'string') extensions = ext.split(',').map(ext => ext.trim())
					if (!extensions.length) extensions = [ 'md' ]
					post(`${url}/api/configuration`, {
						headers: { 'content-type': 'application/json' },
						body: [
							{
								op: 'add',
								path: toPointer([ 'folders', dir ]),
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
