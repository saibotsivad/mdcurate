import { toPointer } from 'pointer-props'


const patch = operations => fetch('/api/configuration', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify(operations),
})
	.then(response => response.json())
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
