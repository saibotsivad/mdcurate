<script>
	import { createEventDispatcher } from 'svelte'
	let dispatch = createEventDispatcher()

	let container

	let clickHandler = event => {
		if (container?.contains(event.target)) dispatch('clickInternal', event)
		else dispatch('clickExternal', event)
	}
</script>

<svelte:window on:click={clickHandler} />

<div bind:this={container}>
	<slot></slot>
</div>
