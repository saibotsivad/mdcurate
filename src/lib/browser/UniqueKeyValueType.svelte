<script>
	import Collapsing from '$lib/browser/Collapsing.svelte'
	import { selectedFile } from '$lib/browser/stores.js'

	export let metadataMap = {}
	export let type

	$: keys = type
		? Object
			.keys(metadataMap[type] || {})
			.map(key => type === '__number' ? key.split('|').pop() : key)
		: Object.keys(metadataMap).filter(key => !key.startsWith('__'))

	const recursivelyAddToMap = (fileMap, iMap) => {
		for (const key in iMap) {
			if (key === '__items') {
				for (const folder in iMap.__items || {}) {
					for (const file in iMap.__items[folder] || {}) {
						fileMap.__fileCount++
						fileMap[folder] = fileMap[folder] || {}
						fileMap[folder][file] = true
					}
				}
			} else {
				recursivelyAddToMap(fileMap, iMap[key])
			}
		}
	}
	let overallFilesCount = 0
	let overallFileMap
	$: {
		overallFilesCount = 0
		const fileMap = { __fileCount: 0 }
		for (const key of keys || []) {
			const safeKey = type === '__number' ? `num|${key}` : key
			const iMap = type
				? metadataMap[type][safeKey]
				: metadataMap[safeKey]
			recursivelyAddToMap(fileMap, iMap)
		}
		const { __fileCount, ...map } = fileMap
		overallFilesCount = __fileCount
		overallFileMap = map
	}


	let resultsLimit = 0
	$: resultsLimitInt = parseInt(resultsLimit || 0, 10)

	const getTotalItemsCount = keyMap => {
		let count = 0
		for (let folder in keyMap.__items || {}) {
			count += Object.keys(keyMap.__items[folder]).length
		}
		return count
	}
</script>

<style>
	.results-limit {
		background-color: var(--primary-bg);
		padding: 0.4em 1em;
	}
	.child-panel {
		margin-left: 1em;
		padding-left: 1em;
		border-left: 2px solid #888;
	}
</style>

{#if keys.length}
	<Collapsing collapsed fileMap={overallFileMap}>
		<span slot="title">
			{#if type === '__number'}
				Numbers
			{:else if type === '__array'}
				Array Elements
			{:else if type === '__object'}
				Object Keys
			{:else}
				Strings
			{/if}
			({overallFilesCount})
		</span>
		<div slot="panel" style="border-bottom: 2px solid #888; background-color: #F8F7F9;">
			{#if metadataMap?.[type]?.__object}
				<div class="child-panel">
					{#each Object.keys(metadataMap[type].__object) as key}
						<svelte:self metadataMap={metadataMap[type].__object[key]} type={key.startsWith('__') ? key : undefined} />
					{/each}
				</div>
			{/if}
			<p class="results-limit">
				<label for="{type}-limiter">Limit to values with more than</label>
				<input type="text" id="{type}-limiter" bind:value={resultsLimit}>
				results.
			</p>
			{#each keys as incorrectKey}
				{@const key = type === '__number' ? `num|${incorrectKey}` : incorrectKey}
				{@const map = type ? metadataMap[type][key] : metadataMap[key]}
				{@const count = getTotalItemsCount(map)}
				{@const childKeys = Object.keys(map || {})}
				{@const stringChildKeys = childKeys.filter(k => !k.startsWith('__'))}
				{#if count > resultsLimitInt}
					<Collapsing collapsed fileMap={map.__items}>
						<span slot="title">
							<code>{incorrectKey}</code>
							<strong>({count})</strong>
						</span>
						<div slot="panel">
							<ul>
								{#each Object.keys(map.__items) as folder}
									<li>
										<strong>{folder}</strong>
										<ul>
											{#each Object.keys(map.__items[folder]) as file}
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
							{#if stringChildKeys.length}
								<h3>HEre it be</h3>
								{#each stringChildKeys as childKey}
									<div class="child-panel">
										<h4>{childKey}</h4>
										<svelte:self metadataMap={map[childKey]} />
									</div>
								{/each}
							{/if}
						</div>
					</Collapsing>
				{/if}
				{#if type === '__object'}
					<Collapsing collapsed fileMap={map}>
						<span slot="title">
							<code>{incorrectKey}</code>
						</span>
						<div slot="panel">
							<div class="child-panel">
								<svelte:self metadataMap={map} />
							</div>
						</div>
					</Collapsing>
				{/if}
			{/each}
		</div>
	</Collapsing>
{/if}
