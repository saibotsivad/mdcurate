<script>
	import FileListing from '$lib/browser/explorer/FileListing.svelte'
	import UniqueKeyValues from '$lib/browser/explorer/UniqueKeyValues.svelte'
	export let fileData

	$: metadataKeys = Object.keys(fileData.metadataKeys || {})

	let panel

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
	}
	td div {
		display: flex;
		align-items: center;
	}
	td div > span {
		flex-grow: 1;
	}
	button {
		margin-left: 1em;
		cursor: pointer;
	}
</style>

<div class="wrapper">
	<div class="data">
		<h2>Metadata Keys</h2>
		<p>This is a list of every metadata key name found across all files.</p>
		{#if !metadataKeys.length}
			<p><em>No metadata keys found.</em></p>
		{:else}
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
					</tr>
				</thead>
				<tbody>
					{#each metadataKeys as key}
					{@const usageCount = fileData.metadataKeys[key].length}
						<tr>
							<td>
								<code>{key}</code>
							</td>
							<td>
								<div>
									<span>
										{usageCount}
									</span>
									<button on:click={() => panel = { key, type: 'metadataKeys', subtype: 'with' }}>
										🔍
									</button>
								</div>
							</td>
							<td>
								<div>
									<span>
										{fileData.fileCount - usageCount}
									</span>
									<button on:click={() => panel = { key, type: 'metadataKeys', subtype: 'without' }}>
										🔍
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
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

<pre>{JSON.stringify(fileData, undefined, 4)}</pre>
