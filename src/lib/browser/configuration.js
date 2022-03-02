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

export const addFolder = folder => patch([
	{
		op: 'add',
		path: '/folders',
		value: folder,
	},
])

export const removeFolder = folder => patch([
	{
		op: 'remove',
		path: toPointer([ 'folders', folder ]),
	},
])
