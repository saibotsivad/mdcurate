<script>
	import Collapsing from '$lib/browser/Collapsing.svelte'
	import { selectedFile } from '$lib/browser/stores.js'
	export let key
	export let values

	let resultsLimit = 0
	$: resultsLimitInt = parseInt(resultsLimit, 10)

	const makeFolderFiles = list => {
		const map = {}
		for (const { folder, file } of list) {
			map[folder] = map[folder] || []
			map[folder].push(file)
		}
		return map
	}

	$: bulkEditableFiles = Object.keys(values || {}).map(value => makeFolderFiles(values[value])).flat()
</script>

<style>
	.results-limit {
		background-color: var(--primary-bg);
		padding: 0.4em 1em;
	}
</style>

<Collapsing collapsed>
	<span slot="title">
		Unique Metadata Values
		<code>{key}</code>
	</span>
	<div slot="panel">
		<p class="results-limit">
			<label for="limiter">Limit to results with more than</label>
			<input type="text" id="limiter" bind:value={resultsLimit}>
			results.
		</p>
		{#each Object.keys(values) as value}
			{@const folderFiles = makeFolderFiles(values[value])}
			{#if values[value].length > resultsLimitInt}
				<Collapsing collapsed bulkEditableFiles={values[value]}>
					<span slot="title">
						<code>{value}</code>
						<strong>({values[value].length})</strong>
					</span>
					<ul slot="panel">
						{#each Object.keys(folderFiles) as folder}
							<li>
								<strong>{folder}</strong>
								<ul>
									{#each folderFiles[folder] as file}
										<li>
											{file}
											<button on:click={() => $selectedFile = { folder, file }}>
												📝
											</button>
										</li>
									{/each}
								</ul>
							</li>
						{/each}
					</ul>
				</Collapsing>
			{/if}
		{/each}
	</div>
</Collapsing>

<hr>
