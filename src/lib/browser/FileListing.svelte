<script>
	import Collapsing from '$lib/browser/Collapsing.svelte'
	import { selectedFile } from '$lib/browser/stores.js'
	export let folderFileMap
	let folderFilesCount = 0
	$: {
		let count = 0
		for (const folder in folderFileMap || {}) {
			count += Object.keys(folderFileMap[folder]).length
		}
		folderFilesCount = count
	}
</script>

<style>
	li {
		padding-bottom: 0.4em;
	}
</style>

<Collapsing collapsed fileMap={folderFileMap}>
	<span slot="title">
		File List
		({folderFilesCount})
	</span>
	<div slot="panel">
		{#each Object.keys(folderFileMap || {}) as folder}
			<strong>{folder}</strong>
			<ul>
				{#each Object.keys(folderFileMap[folder] || {}) as file}
					<li>
						{file}
						<button on:click={() => $selectedFile = { folder, file }}>
							📝
						</button>
					</li>
				{/each}
			</ul>
		{/each}
	</div>
</Collapsing>
