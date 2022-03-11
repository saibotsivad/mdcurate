import { writable, derived } from 'svelte/store'

export const configuration = writable(null)

export const curatorState = derived(configuration, $configuration => {
	const statuses = Object
		.keys($configuration && $configuration.folders || {})
		.map(folder => $configuration.folders[folder].status)
	if (statuses.includes('error')) return 'ERROR'
	if (!$configuration || statuses.find(status => status !== 'loaded')) return 'WAITING'
	return 'LOADED'
})

export const fileDetails = writable(null)

export const selectedFile = writable(null)

export const bulkEditorFileMap = writable(null)
