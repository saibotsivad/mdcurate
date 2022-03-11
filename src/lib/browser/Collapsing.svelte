<script>
	import { bulkEditorFileMap } from '$lib/browser/stores.js'
	export let collapsed
	export let fileMap

	let count = 0
	$: {
		count = 0
		for (const folder in fileMap || {}) {
			for (const file in fileMap[folder] || {}) count++
		}
	}
</script>

<h3>
	<slot name="title" />
	<button on:click={() => collapsed = !collapsed}>
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
