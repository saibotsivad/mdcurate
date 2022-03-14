import dlv from 'dlv'
import { dset } from 'dset'

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
			const { metadata, errors, warnings } = folderFileData[folder][file]
			if (errors?.length) output.errors.push(...errors.map(value => ({ folder, file, value })))
			if (warnings?.length) output.warnings.push(...warnings.map(value => ({ folder, file, value })))

			for (let key of Object.keys(metadata || {})) {
				output.metadataKeys[key] = output.metadataKeys[key] || {}
				output.metadataKeys[key].__fileCount = output.metadataKeys[key].__fileCount || 0
				output.metadataKeys[key].__fileCount++
				output.metadataKeys[key][folder] = output.metadataKeys[key][folder] || {}
				output.metadataKeys[key][folder][file] = true

				output.metadataMap = output.metadataMap || {}
				output.metadataMap[key] = output.metadataMap[key] || {}
				const add = mapKeypath => {
					const itemsKeypath = [ ...mapKeypath, '__items' ]
					const items = dlv(output.metadataMap, itemsKeypath) || {}
					items[folder] = items[folder] || {}
					items[folder][file] = true
					dset(output.metadataMap, itemsKeypath, items)
				}
				const recurse = (metadataKeypath, mapKeypath) => {
					const currentValue = dlv(metadata, metadataKeypath)
					if (Array.isArray(currentValue)) {
						const arrayKeypath = [ ...mapKeypath, '__array' ]
						if (!dlv(output.metadataMap, arrayKeypath)) dset(output.metadataMap, arrayKeypath, {})
						for (let index = 0; index < currentValue.length; index++) {
							recurse([ ...metadataKeypath, index ], arrayKeypath)
						}
					} else if (currentValue === true || currentValue === false || currentValue === null) {
						const primitiveKeypath = [ ...mapKeypath, (currentValue === null ? '__null' : '__boolean') ]
						if (!dlv(output.metadataMap, primitiveKeypath)) dset(output.metadataMap, primitiveKeypath, {})
						add([ ...primitiveKeypath, (currentValue === null ? 'null' : currentValue.toString()) ])
					} else if (typeof currentValue === 'object') {
						const objectKeypath = [ ...mapKeypath, '__object' ]
						if (!dlv(output.metadataMap, objectKeypath)) dset(output.metadataMap, objectKeypath, {})
						for (const objectKey in currentValue) {
							recurse([ ...metadataKeypath, objectKey ], [ ...objectKeypath, objectKey ])
						}
					} else if (typeof currentValue === 'number') {
						const numberKeypath = [ ...mapKeypath, '__number' ]
						if (!dlv(output.metadataMap, numberKeypath)) dset(output.metadataMap, numberKeypath, {})
						add([ ...numberKeypath, `num|${currentValue}` ])
					} else {
						add([ ...mapKeypath, currentValue ])
					}
				}
				recurse([ key ], [ key ])
			}
		}
	}

	return output
}
