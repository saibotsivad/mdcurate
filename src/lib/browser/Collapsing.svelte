<script>
	import { bulkEditorFileMap } from '$lib/browser/stores.js'
	export let collapsed
	export let fileMap

	let count = 0
	$: {
		let c = 0
		for (const folder in fileMap || {}) c += Object.keys(fileMap[folder] || {}).length
		count = c
	}
</script>

<h3>
	<slot name="title" />
	<button on:click={() => collapsed = !collapsed}>
		Files
		{#if collapsed}
			📁
		{:else}
			📂️
		{/if}
	</button>
	{#if count}
		<button style="margin-left: 1em;" on:click={() => $bulkEditorFileMap = fileMap}>
			Bulk Edit 🗂
		</button>
	{/if}
</h3>

{#if !collapsed}
	<slot name="panel" />
{/if}
