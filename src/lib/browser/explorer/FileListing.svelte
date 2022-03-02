<script>
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

<h3>File List</h3>

{#each Object.keys(folderToFilesMap || {}) as folder}
	<strong>{folder}</strong>
	<ul>
		{#each folderToFilesMap[folder] as file}
			<li>{file}</li>
		{/each}
	</ul>
{/each}
