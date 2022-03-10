<script>
	import { bulkEditorFiles } from '$lib/browser/stores.js'
	export let collapsed
	export let bulkEditableFiles
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
	{#if bulkEditableFiles?.length}
		<button style="margin-left: 2em;" on:click={() => $bulkEditorFiles = bulkEditableFiles}>
			Bulk Edit 🗂
		</button>
	{/if}
</h3>

{#if !collapsed}
	<slot name="panel" />
{/if}
