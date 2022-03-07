<script>
	import { minimumDelay } from '$lib/delay.js'
	import { post } from '$lib/browser/post.js'
	import FileListing from '$lib/browser/explorer/FileListing.svelte'
	import UniqueKeyValues from '$lib/browser/explorer/UniqueKeyValues.svelte'
	export let fileData

	$: metadataKeys = Object.keys(fileData.metadataKeys || {})

	let panel
	let rename = {}

	const folderFilesForKey = (key, filesWith) => {
		const folderFiles = []
		if (filesWith) {
			folderFiles.push(...fileData.metadataKeys[key])
		} else {
			for (const { file, folder } of fileData.folderFiles) {
				if (!fileData.metadataKeys[key].find(f => f.file === file && f.folder === folder)) {
					folderFiles.push({ file, folder })
				}
			}
		}
		return folderFiles
	}

	let saving = {}
	let saved = {}
	const renameKey = (original, updated) => {
		saving[original] = true
		minimumDelay(600, post('/api/metadata', { action: 'rename', params: { original, updated, files: fileData.metadataKeys[original] } }))
			.then(() => fetch('/api/files'))
			.then(r => r.json())
			.then(updatedFileData => {
				fileData = updatedFileData
				saving = {}
				saved = { [updated]: true }
				setTimeout(() => {
					saved = {}
				}, 500)
			})
	}
</script>

<style>
	div.wrapper {
		display: flex;
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
	.explorer {
		margin-left: 4em;
		padding-left: 4em;
		border-left: 4px solid var(--primary-bg);
		min-height: 100%;
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
	@keyframes onClearAnimation {
		0% {
			background-color: var(--success-bg);
		}
		80% {
			background-color: #fff;
		}
		100% {
			background-color: #fff;
		}
	}
	input.saved {
		background-color: var(--success-bg);
		animation-name: onClearAnimation;
		animation-duration: 1s;
	}
	tr:hover button.same-name {
		border-color: var(--primary-light);
		background-color: var(--primary-light);
		color: var(--primary-light);
	}
	tr:hover {
		background-color: var(--primary-light);
	}
</style>

<div class="wrapper">
	<div class="data">
		<h2>Metadata Keys</h2>
		<p>This is a list of every metadata key name found across all files.</p>
		{#if !metadataKeys.length}
			<p><em>No metadata keys found.</em></p>
		{:else}
			<fieldset disabled={Object.keys(saving).length}>
				<table>
					<thead>
						<tr>
							<th>
								Key Name
							</th>
							<th>
								Count
							</th>
							<th>
								Files w/o
							</th>
							<th>
								Delete
							</th>
						</tr>
					</thead>
					<tbody>
						{#each metadataKeys as key}
						{@const usageCount = fileData.metadataKeys[key].length}
							<tr>
								<td class="filename-input">
									<input
										type="text"
										value={key}
										class:saved={saved[key]}
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
									<button>
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
			<h2>Explorer</h2>
			{#if panel.type === 'metadataKeys'}
				<FileListing folderFiles={folderFilesForKey(panel.key, panel.subtype === 'with')} />
				{#if panel.subtype === 'with'}
					<UniqueKeyValues key={panel.key} values={fileData.metadataKeyValues[panel.key]} />
				{/if}
			{/if}
		</div>
	{/if}
</div>
