<script context="module">
	export async function load({ url }) {
		const configuration = await fetch(url.origin + '/api/configuration').then(r => r.json())
		return {
			props: { configuration },
		}
	}
</script>

<script>
	import MetadataExplorer from '$lib/browser/MetadataExplorer.svelte'
	import Editor from '$lib/browser/Editor.svelte'
	export let configuration
	$: shouldWait = Object
		.keys(configuration.folders || {})
		.map(folder => configuration.folders[folder].status)
		.find(status => status === 'error' || status !== 'loaded')
	$: needToAddFolders = !Object.keys(configuration?.folders || {}).length
	$: filesPromise = !shouldWait && !needToAddFolders && fetch('/api/files').then(r => r.json())
</script>

<svelte:head>
	<title>Curate</title>
</svelte:head>

<Editor />

{#if shouldWait}
	<div class="content">
		<h2>Ope!</h2>
		<p>There are one or more folders that are still loading or have errors!</p>
		<p>Head back to the <a href="/configure">configuration page</a> and have a look.</p>
	</div>
{:else if needToAddFolders}
	<div class="content">
		<h2>No Folders</h2>
		<p>
			The first thing to do is add some folders, over in the
			<a href="/configure">configuration page</a>.
		</p>
		<p>
			After you add folders, you'll be able to come over here and
			start organizing the metadata.
		</p>
	</div>
{:else}
	<div class="content">
		{#await filesPromise}
			<p>Loading the file details...</p>
		{:then fileData}
			<MetadataExplorer {fileData} />
		{:catch error}
			<p>Oh no, there was an error!</p>
		{/await}
	</div>
{/if}
