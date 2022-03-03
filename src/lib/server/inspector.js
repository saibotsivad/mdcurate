import stringifyKeys from 'stringify-keys'
import dlv from 'dlv'

export const inspectFolderFileMap = folderFileData => {
	const output = {
		folderFiles: [],
		fileCount: 0,
		errors: [],
		warnings: [],
		metadataKeys: {},
		metadataKeyValues: {},
	}

	for (const folder in folderFileData) {
		for (const file in folderFileData[folder]) {
			output.folderFiles.push({ folder, file })
			output.fileCount++
			const { metadata, blocks, errors, warnings } = folderFileData[folder][file]
			if (errors?.length) output.errors.push(...errors.map(value => ({ folder, file, value })))
			if (warnings?.length) output.warnings.push(...warnings.map(value => ({ folder, file, value })))

			const metadataKeys = stringifyKeys(metadata || {})
			for (let key of metadataKeys) {
				// For arrays that aren't deep, we'll drop the array index off the key name, so it makes more
				// sense when you're looking around.
				const parts = key.split('.')
				if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
					const end = parts.pop()
					key = parts.join('.')
					if (!Array.isArray(dlv(folderFileData[folder][file].metadata, key))) key = `${key}.${end}`
				}
				let value = dlv(folderFileData[folder][file].metadata, key)
				if (value) {
					output.metadataKeyValues[key] = output.metadataKeyValues[key] || {}
					value = Array.isArray(value) ? value : [ value ]
					for (const val of value) {
						output.metadataKeyValues[key][val] = output.metadataKeyValues[key][val] || []
						output.metadataKeyValues[key][val].push({ file, folder })
					}
				}

				output.metadataKeys[key] = output.metadataKeys[key] || []
				output.metadataKeys[key].push({ file, folder })

			}
		}
	}

	return output
}
