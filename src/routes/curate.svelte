<script>
	import MetadataExplorer from '$lib/browser/MetadataExplorer.svelte'
	import Editor from '$lib/browser/Editor.svelte'
	import BulkMetadataEditor from '$lib/browser/BulkMetadataEditor.svelte'
	import { configuration, curatorState, fileDetails } from '$lib/browser/stores.js'

	$: shouldWait = Object
		.keys($configuration && $configuration.folders || {})
		.map(folder => $configuration.folders[folder].status)
		.find(status => status === 'error' || status !== 'loaded')
	$: needToAddFolders = !Object.keys($configuration?.folders || {}).length
</script>

<svelte:head>
	<title>Curate</title>
</svelte:head>

<Editor />
<BulkMetadataEditor />

{#if !Object.keys($configuration.folders || {}).length}
	<div class="content">
		<h2>Ope!</h2>
		<p>You'll need to head to the <a href="/configure">configuration page</a> and add some folders first.</p>
	</div>
{:else if shouldWait}
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
		<fieldset disabled={$curatorState !== 'LOADED'}>
			<MetadataExplorer />
		</fieldset>
	</div>
{/if}
