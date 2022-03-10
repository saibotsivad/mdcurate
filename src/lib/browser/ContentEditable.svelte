<script>
	export let value
	export let label
	export let readonly
	export let lineHeight = 1.2
	$: height = (value || '').split('\n').length * lineHeight
</script>

<style>
	div.content-editable-container {
		position: relative;
	}
	span {
		position: absolute;
		top: -0.6em;
		left: 1em;
		background-color: #fff;
		font-size: 0.7em;
		padding: 0 0.3em;
		color: #98a1aa;
	}
	textarea {
		white-space: pre;
		font-family: monospace;
		border: 1px solid #888;
		padding: 1em;
		background-color: #f4f6f8;
		width: 100%;
	}
	textarea:focus {
		border: 1px solid var(--primary-highlight);
		outline: 2px solid var(--primary-bg);
	}
	textarea[readonly] {
		background-color: #fff;
	}
</style>

<div class="content-editable-container">
	{#if label}
		<span>{label}</span>
	{/if}
	<textarea bind:value {readonly} style="height: {height}em; line-height: {lineHeight};"></textarea>
</div>
