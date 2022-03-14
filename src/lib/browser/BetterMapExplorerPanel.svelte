<script>
	import BetterMapExplorer from '$lib/browser/BetterMapExplorer.svelte'
	import { getFileMapFromMetadataMap, getFileMapCount } from '$lib/browser/metadata-map-helpers.js'
	import { bulkEditorFileMap, selectedFile } from '$lib/browser/stores.js'

	export let name
	export let metadataMap
	export let isNull

	$: fileMap = metadataMap && getFileMapFromMetadataMap(metadataMap)
	$: count = fileMap && getFileMapCount(fileMap)

	let showFileExplorer
	let showMetadataExplorer
</script>

<style>
	button {
		margin-left: 1em;
	}
	div {
		margin-left: 1em;
		padding-left: 1em;
		border-left: 2px solid var(--info-bg)
	}
</style>

<h3>
	{#if name}
		{name}
	{:else}
		<em style="font-family: monospace; font-weight: normal;">Empty String</em>
	{/if}
	({count})
	{#if !isNull}
		<button on:click={() => showMetadataExplorer = !showMetadataExplorer}>
			🔍
			{#if showMetadataExplorer}
				🔽
			{:else}
				▶️
			{/if}
		</button>
	{/if}
	<button on:click={() => showFileExplorer = !showFileExplorer}>
		{#if showFileExplorer}
			Files 📂️
		{:else}
			Files 📁
		{/if}
	</button>
	{#if count}
		<button style="margin-left: 1em;" on:click={() => $bulkEditorFileMap = fileMap}>
			Bulk Edit 🗂
		</button>
	{/if}
</h3>
{#if showFileExplorer || showMetadataExplorer}
	<div>
		{#if showFileExplorer}
			{#each Object.keys(fileMap || {}) as folder}
				<strong>{folder}</strong>
				<ul>
					{#each Object.keys(fileMap[folder] || {}) as file}
						<li>
							{file}
							<button on:click={() => $selectedFile = { folder, file }}>
								📝
							</button>
						</li>
					{/each}
				</ul>
			{/each}
		{/if}
		{#if showMetadataExplorer}
			<BetterMapExplorer {metadataMap} />
		{/if}
	</div>
{/if}
