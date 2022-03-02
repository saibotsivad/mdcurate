<script>
	export let key
	export let values

	const makeFolderFiles = list => {
		const map = {}
		for (const { folder, file } of list) {
			map[folder] = map[folder] || []
			map[folder].push(file)
		}
		return map
	}
</script>

<style>
	code {
		background-color: var(--info-bg);
		color: var(--info-text);
		padding: 0.4em 1em;
		border-radius: 0.3em;
	}
</style>

<h3>
	Unique Metadata Values
	<code>{key}</code>
</h3>

{#each Object.keys(values) as value}
	{@const folderFiles = makeFolderFiles(values[value])}
	<strong>{value}</strong>
	<ul>
		{#each Object.keys(folderFiles) as folder}
			<li>
				<strong>{folder}</strong>
				<ul>
					{#each folderFiles[folder] as file}
						<li>{file}</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ul>
{/each}
