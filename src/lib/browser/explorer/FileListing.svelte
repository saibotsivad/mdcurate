<script>
	import Collapsing from '$lib/browser/explorer/Collapsing.svelte'
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

<Collapsing>
	<span slot="title">
		File List
	</span>
	<div slot="panel">
		{#each Object.keys(folderToFilesMap || {}) as folder}
			<strong>{folder}</strong>
			<ul>
				{#each folderToFilesMap[folder] as file}
					<li>{file}</li>
				{/each}
			</ul>
		{/each}
	</div>
</Collapsing>
