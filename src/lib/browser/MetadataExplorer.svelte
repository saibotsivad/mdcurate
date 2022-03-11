<script>
	import { minimumDelay } from '$lib/delay.js'
	import { post } from '$lib/browser/post.js'
	import FileListing from '$lib/browser/FileListing.svelte'
	import UniqueKeyValues from '$lib/browser/UniqueKeyValues.svelte'
	import { selectedFile, fileDetails } from '$lib/browser/stores.js'

	$: fileData = $fileDetails
	$: metadataKeys = Object.keys(fileData.metadataKeys || {})

	let panel
	let renameOpen = {}
	let rename = {}

	const folderFilesForKey = (key, filesWith) => {
		const folderFiles = []
		if (filesWith) {
			for (const folder in fileData.metadataKeys[key]) {
				for (const file in fileData.metadataKeys[key][folder]) folderFiles.push({ folder, file })
			}
		} else {
			for (const { file, folder } of fileData.folderFiles) {
				if (!fileData.metadataKeys[key]?.[folder]?.[file]) {
					folderFiles.push({ file, folder })
				}
			}
		}
		return folderFiles
	}

	$: folderFiles = panel && folderFilesForKey(panel.key, panel.subtype === 'with')

	$: groupedErrors = fileData.errors?.reduce((map, { folder, file, value }) => {
		map[folder] = map[folder] || {}
		map[folder][file] = map[folder][file] || []
		map[folder][file].push(value)
		return map
	}, {})
	let showErrors = {}

	let saving = {}
	const renameKey = (original, updated) => {
		saving[original] = true
		minimumDelay(500, post('/api/metadata', { action: 'rename', params: { original, updated, fileMap: fileData.metadataKeys[original] } }))
			.then(() => fetch('/api/files'))
			.then(r => r.json())
			.then(updatedFileData => {
				$fileDetails = updatedFileData
				saving = {}
				setTimeout(() => {
					renameOpen = {}
					rename = {}
				}, 500)
			})
	}

	let removingKey
	const removeKey = key => {
		removingKey = true
		minimumDelay(500, post('/api/metadata', { action: 'remove', params: { key, fileMap: fileData.metadataKeys[key] } }))
			.then(() => fetch('/api/files'))
			.then(r => r.json())
			.then(updatedFileData => {
				$fileDetails = updatedFileData
				removingKey = false
			})
	}
</script>

<style>
	div.wrapper {
		display: flex;
	}
	.explorer {
		margin-left: 4em;
		padding-left: 4em;
		border-left: 4px solid var(--primary-bg);
		min-height: 100%;
		flex-grow: 1;
	}
	td div {
		display: flex;
		align-items: center;
	}
	td div > span {
		flex-grow: 1;
	}
	td.filename-input {
		white-space: nowrap;
	}
	button.deeper {
		margin-left: 1em;
		cursor: pointer;
	}
	button.rename {
		width: 5rem;
	}
	button.same-name {
		border-color: #fff;
		background-color: #fff;
		color: #fff;
	}
	tr:hover button.same-name {
		border-color: var(--primary-light);
		background-color: var(--primary-light);
		color: var(--primary-light);
	}
	tr:hover {
		background-color: var(--primary-light);
	}
	.explorer h2 {
		padding: 0.5em;
		background-color: var(--primary-bg);
	}
	tr.selected {
		background-color: var(--info-bg);
	}
	tr.selected button.same-name {
		border-color: var(--info-bg);
		background-color: var(--info-bg);
		color: var(--info-bg);
	}
</style>

{#if Object.keys(groupedErrors).length}
	<div class="wrapper" style="border-bottom: 4px solid var(--primary-bg);">
		<div class="data">
			<h2>Loading Errors!</h2>
			{#each Object.keys(groupedErrors) as folder}
				<strong>{folder}</strong>
				<ul>
					{#each Object.keys(groupedErrors[folder]) as file}
						<li>
							{file}
							<button on:click={() => $selectedFile = { folder, file }}>
								📝
							</button>
							<span style="margin-left: 2em;">Errors:</span>
							<code>{groupedErrors[folder][file].map(error => error.name).filter(Boolean).join(', ')}</code>
							<button on:click={() => { showErrors[folder] = showErrors[folder] || {}; showErrors[folder][file] = !showErrors[folder][file] }}>
								🔍
							</button>
							{#if showErrors[folder]?.[file]}
								{#each groupedErrors[folder][file] as error}
									<pre>{JSON.stringify(error, undefined, 4)}</pre>
								{/each}
							{/if}
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</div>
{/if}

<div class="wrapper">
	<div class="data">
		<h2>Metadata Keys</h2>
		<p>This is a list of every metadata key name found across all files.</p>
		{#if !metadataKeys.length}
			<p><em>No metadata keys found.</em></p>
		{:else}
			<fieldset disabled={Object.keys(saving).length || removingKey}>
				<table>
					<thead>
						<tr>
							<th>
								Key Name
							</th>
							<th>
								Files With
							</th>
							<th>
								Files Without
							</th>
							<th>
								Delete
							</th>
						</tr>
					</thead>
					<tbody>
						{#each metadataKeys.sort() as key}
						{@const usageCount = fileData.metadataKeys[key].__fileCount}
							<tr class:selected={panel?.key === key}>
								<td class="filename-input">
									<button on:click={() => renameOpen[key] = ! renameOpen[key]}>
										📝
									</button>
									{#if renameOpen[key]}
										<input
											type="text"
											value={key}
											on:input={event => rename[key] = event.target.value}
										>
										<button
											class="rename"
											class:same-name={!saving[key] && !rename[key] || rename[key] === key}
											disabled={!rename[key] || rename[key] === key}
											on:click={() => renameKey(key, rename[key])}
										>
											{#if saving[key]}
												Saving...
											{:else}
												Rename
											{/if}
										</button>
									{:else}
										{key}
									{/if}
								</td>
								<td>
									<div>
										<span>
											{usageCount}
										</span>
										<button class="deeper" on:click={() => panel = { key, type: 'metadataKeys', subtype: 'with' }}>
											🔍
										</button>
									</div>
								</td>
								<td>
									<div>
										<span>
											{fileData.fileCount - usageCount}
										</span>
										<button class="deeper" on:click={() => panel = { key, type: 'metadataKeys', subtype: 'without' }}>
											🔍
										</button>
									</div>
								</td>
								<td>
									<button disabled={removingKey} on:click={() => removeKey(key)}>
										🗑
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</fieldset>
		{/if}
	</div>
	{#if panel}
		<div class="explorer">
			{#if panel.type === 'metadataKeys'}
				<h2>
					<small>
						<code>{panel.key}</code>
						<span style="font-weight: normal;">{panel.subtype}</span>
					</small>
				</h2>
				<FileListing {folderFiles} />
				{#if panel.subtype === 'with'}
					<UniqueKeyValues key={panel.key} {fileData} />
				{/if}
			{/if}
		</div>
	{/if}
</div>
