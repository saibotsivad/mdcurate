export const getFileMapFromMetadataMap = metadataMap => {
	const map = {}
	const recursivelyBuildFolderFileMap = obj => {
		for (const key in obj) {
			if (key === '__items') {
				for (const folder in obj.__items) {
					for (const file in obj.__items[folder]) {
						map[folder] = map[folder] || {}
						map[folder][file] = true
					}
				}
			} else {
				recursivelyBuildFolderFileMap(obj[key])
			}
		}
	}
	recursivelyBuildFolderFileMap(metadataMap)
	return map
}

export const getFileMapCount = fileMap => {
	let count = 0
	for (const folder in fileMap) count += Object.keys(fileMap[folder]).length
	return count
}
