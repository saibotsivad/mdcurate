<script>
	export let folder

	const statusToName = {
		loading: 'Loading...',
		loaded: 'Loaded',
		removing: 'Removing...',
	}
	const errorCodeToText = {
		ENOENT: 'Invalid Folder',
	}
</script>

<style>
	span {
		padding: 0.3em 1em;
		border-radius: 0.3em;
	}
	span.error {
		color: var(--error-text);
		background-color: var(--error-bg);
	}
	span.success {
		color: var(--success-text);
		background-color: var(--success-bg);
	}
	span.info {
		color: var(--info-text);
		background-color: var(--info-bg);
	}
</style>

<span class:error={folder.status === 'error'} class:success={folder.status === 'loaded'} class:info={folder.status !== 'error' && folder.status !== 'loaded'}>
	{#if folder.status === 'error'}
		<strong>Error:</strong>
		{errorCodeToText[folder.error.code] || folder.error.code}
	{:else}
		{statusToName[folder.status] || folder.status}
	{/if}
</span>
