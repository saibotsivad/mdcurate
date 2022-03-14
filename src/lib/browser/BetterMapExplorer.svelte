<script>
	import BetterMapExplorerPanel from '$lib/browser/BetterMapExplorerPanel.svelte'

	export let metadataMap = {}
	export let parentIsObject

	$: stringKeys = Object
		.keys(metadataMap)
		.filter(key => !key.startsWith('__'))
		.sort()

	const typedToName = {
		// order of appearance is order in UI
		__number: 'Numbers',
		__boolean: 'Booleans',
		__null: 'Null',
		__object: 'Object Keys',
		__array: 'Array Items',
	}
</script>

{#each stringKeys as key}
	<BetterMapExplorerPanel
		name={key}
		metadataMap={metadataMap[key]}
		isEmpty={Object.keys(metadataMap[key]).length === 1 && metadataMap[key].__items}
	/>
{/each}

{#each Object.keys(typedToName) as type}
	{#if metadataMap[type]}
		<BetterMapExplorerPanel
			name={typedToName[type]}
			metadataMap={metadataMap[type]}
			isEmpty={type === '__null'}
		/>
	{/if}
{/each}
