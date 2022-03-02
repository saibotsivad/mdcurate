import { klona } from 'klona'
import { loadAllFiles } from '$lib/server/file-manager.js'
import { inspectFolderFileMap } from '$lib/server/inspector.js'
import { DEFAULT_EXTENSIONS } from '$lib/variables.js'

const configuration = {
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
}, 500)

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
}, 500)

export const getConfiguration = () => klona(configuration)

export const addFolder = (folder, extensions) => {
	configuration.folders[folder] = {
		status: 'loading',
		extensions,
	}
	return klona(configuration)
}

export const removeFolder = folder => {
	configuration.folders[folder].status = 'removing'
	return klona(configuration)
}

export const getFolderFiles = () => klona(inspectedFolderFiles)

// TODO remove in prod
// addFolder('/path/to/folder', [ 'md' ])
addFolder('/Users/saibotsivad/Development/git/KayserCommentary/Markdown/Web', [ 'md' ])
