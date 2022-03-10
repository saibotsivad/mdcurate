<script>
	export let panelOpenStore
	let panel
	const scrimClickHandler = event => {
		if (!panel?.contains(event.target)) $panelOpenStore = false
	}
	const escapeHandler = event => {
		if (event.keyCode === 27) $panelOpenStore = false
	}
</script>

<svelte:window on:keyup={escapeHandler} />

<svelte:head>
	{#if $panelOpenStore}
		<style>
			body {
				height: 100vh;
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<style>
	.panel-scrim {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #0000004a;
	}
	.panel-modal {
		position: fixed;
		top: 2em;
		left: 5em;
		right: 5em;
		border: 8px solid var(--primary-light);
		padding: 1em 4em 2em 4em;
		background-color: #fff;
		box-shadow: 0 0 1em 0 #333;
		overflow-y: scroll;
		height: calc(100vh - 8em);
	}
</style>

{#if $panelOpenStore}
	<div class="panel-scrim" on:click={scrimClickHandler}>
		<div class="panel-modal" bind:this={panel}>
			<slot></slot>
		</div>
	</div>
{/if}
