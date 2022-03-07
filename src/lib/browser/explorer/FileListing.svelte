<script>
	import Collapsing from '$lib/browser/explorer/Collapsing.svelte'
	import { selectedFile } from '$lib/browser/editor-store.js'
	export let folderFiles
	const remap = list => {
		const map = {}
		for (const { file, folder } of list) {
			map[folder] = map[folder] || []
			map[folder].push(file)
		}
		return map
	}
	$: folderToFilesMap = remap(folderFiles)
</script>

<style>
	li {
		padding-bottom: 0.4em;
	}
</style>

<Collapsing>
	<span slot="title">
		File List
	</span>
	<div slot="panel">
		{#each Object.keys(folderToFilesMap || {}) as folder}
			<strong>{folder}</strong>
			<ul>
				{#each folderToFilesMap[folder] as file}
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
