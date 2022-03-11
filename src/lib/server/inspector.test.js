import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { inspectFolderFileMap } from './inspector.js'

const expectedMetadataMap = {
	'tags': {
		'foo, bar, biz': {
			'__items': {
				'folder1': {
					'file1': true,
				},
			},
		},
		'__array': {
			'foo': {
				'__items': {
					'folder1': {
						'file2': true,
					},
				},
			},
			'fizz': {
				'__items': {
					'folder1': {
						'file2': true,
					},
				},
			},
			'__object': {
				'foo': {
					'bar': {
						'__items': {
							'folder1': {
								'file2': true,
							},
						},
					},
				},
				'car': {
					'red': {
						'__items': {
							'folder1': {
								'file2': true,
							},
						},
					},
				},
			},
			'__number': {
				'num|24': {
					'__items': {
						'folder1': {
							'file2': true,
						},
					},
				},
			},
		},
		'__object': {
			'bar': {
				'buzz': {
					'__items': {
						'folder2': {
							'file3': true,
						},
					},
				},
			},
			'baz': {
				'__array': {
					'bizz': {
						'__items': {
							'folder2': {
								'file3': true,
							},
						},
					},
				},
			},
		},
		'__number': {
			'num|42': {
				'__items': {
					'folder2': {
						'file4': true,
					},
				},
			},
		},
	},
}


test('build the metadata map correctly', () => {
	const output = inspectFolderFileMap({
		folder1: {
			file1: {
				metadata: {
					tags: 'foo, bar, biz',
				},
			},
			file2: {
				metadata: {
					tags: [
						'foo',
						'fizz',
						{ foo: 'bar' },
						{ car: 'red' },
						24,
					],
				},
			},
		},
		folder2: {
			file3: {
				metadata: {
					tags: {
						bar: 'buzz',
						baz: [ 'bizz' ],
					},
				},
			},
			file4: {
				metadata: {
					tags: 42,
				},
			},
		},
	})

	assert.equal(output.fileCount, 4)
	assert.equal(output.folderFiles.length, 4)
	assert.equal(output.folderFiles[0], { folder: 'folder1', file: 'file1' })
	assert.equal(output.folderFiles[1], { folder: 'folder1', file: 'file2' })
	assert.equal(output.folderFiles[2], { folder: 'folder2', file: 'file3' })
	assert.equal(output.folderFiles[3], { folder: 'folder2', file: 'file4' })

	assert.equal(output.metadataKeys.tags, {
		__fileCount: 4,
		folder1: {
			file1: true,
			file2: true,
		},
		folder2: {
			file3: true,
			file4: true,
		},
	})

	assert.equal(output.metadataMap, expectedMetadataMap)
})

test.run()
