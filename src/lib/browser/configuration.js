import { post } from '$lib/browser/post.js'
import { toPointer } from 'pointer-props'

const patch = operations => post('/api/configuration', operations)
	.catch(error => {
		console.error('There was an error updating the configuration!', error)
	})

export const addFolder = (folder, extensions) => patch([
	{
		op: 'add',
		path: toPointer([ 'folders', folder ]),
		value: { extensions },
	},
])

export const removeFolder = folder => patch([
	{
		op: 'remove',
		path: toPointer([ 'folders', folder ]),
	},
])
