import timers from 'node:timers/promises'
import { klona } from 'klona'
import { loadAllFiles } from '$lib/server/file-manager.js'
import { inspectFolderFileMap } from '$lib/server/inspector.js'
import { DEFAULT_EXTENSIONS } from '$lib/variables.js'

const configuration = {
	saveAsBlockdown: false,
	folders: {
		/*
		'/path/to/folder': {
			status: 'loading' | 'error' | 'removing' | 'loaded'
			error: { code, message }
			extensions: [ 'md', 'txt' ]
		}
		 */
	},
}
const internalRawFileData = {
	/*
	'/path/to/folder': {
		'path/to/file.md': { metadata, blocks, errors, warnings }
	}
	 */
}
let inspectedFolderFiles = {}

let loading
setInterval(() => {
	const needsLoaded = Object
		.keys(configuration.folders)
		.filter(folder => configuration.folders[folder].status === 'loading')
	if (!loading && needsLoaded.length) {
		loading = true
		Promise.all(needsLoaded.map(
			folder => loadAllFiles(folder, configuration.folders[folder].extensions || DEFAULT_EXTENSIONS)
				.then(fileData => {
					internalRawFileData[folder] = fileData
					configuration.folders[folder].status = 'loaded'
				})
				.catch(error => {
					configuration.folders[folder] = { error, status: 'error' }
				}),
		)).catch(error => {
			console.error('Unexpected error while loading files.', error)
			throw error
		}).then(() => {
			inspectedFolderFiles = inspectFolderFileMap(internalRawFileData)
			loading = false
		})
	}
}, 100)

let removing
setInterval(() => {
	const needsRemoved = Object
		.keys(configuration.folders)
		.filter(folder => configuration.folders[folder].status === 'removing')
	if (!removing && needsRemoved.length) {
		removing = true
		Promise.all(needsRemoved.map(
			folder => {
				delete internalRawFileData[folder]
				inspectedFolderFiles = inspectFolderFileMap(internalRawFileData)
				delete configuration.folders[folder]
			},
		)).catch(error => {
			console.error('Unexpected error while removing files.', error)
			throw error
		}).then(() => {
			removing = false
		})
	}
}, 100)

export const getConfiguration = () => klona(configuration)

const waitForLoadingCompletion = async () => {
	while (loading || removing || Object.keys(configuration.folders).find(folder => configuration.folders[folder].status === 'loading')) {
		await timers.setTimeout(1000)
		console.log('Waiting for loading to complete...')
	}
}

const waitForStatusCompletion = async (folder, status) => {
	while (loading || removing || configuration.folders?.[folder]?.status === status) {
		await timers.setTimeout(1000)
		console.log('Waiting for status to change for folder...')
	}
}

export const addFolder = async (folder, extensions) => {
	configuration.folders[folder] = {
		status: 'loading',
		extensions,
	}
	await waitForStatusCompletion(folder, 'loading')
}

export const removeFolder = async folder => {
	configuration.folders[folder].status = 'removing'
	await waitForStatusCompletion(folder, 'removing')
}

export const reloadEverything = async () => {
	for (const folder in configuration.folders) {
		configuration.folders[folder].status = 'loading'
	}
	await waitForLoadingCompletion()
}

export const getFolderFiles = () => klona(inspectedFolderFiles)

// For easier testing, when running `npm run dev` you can pass in a value to set a folder
// automatically, so on restart it'll retain that folder:
//
//    npm run dev -- /path/to/folder
//
if (process.env.npm_command === 'run-script') {
	await addFolder(process.argv[3], [ 'md' ])
}
