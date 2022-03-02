<script>
	let collapsed
</script>


<h3>
	<slot name="title" />
	<button on:click={() => collapsed = !collapsed}>
		{#if collapsed}
			⬇️
		{:else}
			➡️
		{/if}
	</button>
</h3>

{#if !collapsed}
	<slot name="panel" />
{/if}
