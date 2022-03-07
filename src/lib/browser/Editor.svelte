<script>
	import { post } from '$lib/browser/post.js'
	import { selectedFile } from '$lib/browser/editor-store.js'
	let panelOpen
	let panel
	let previousContents
	let contents
	let saving

	const close = () => {
		$selectedFile = null
		panelOpen = false
	}

	$: filePromise = $selectedFile && post('/api/file', { action: 'read', ...$selectedFile })
		.then(response => {
			panelOpen = true
			previousContents = response.contents
			contents = response.contents
			return response
		})

	const scrimClickHandler = event => {
		if (!panel?.contains(event.target)) close()
	}

	const saveFile = () => {
		saving = true
		post('/api/file', { action: 'write', ...$selectedFile, contents })
			.then(() => close())
			.then(() => {
				saving = false
			})
	}
</script>

<svelte:head>
	{#if panelOpen}
		<style>
			body {
				height: 100vh;
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<style>
	.editor-scrim {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #0000004a;
	}
	.editor-modal-panel {
		position: fixed;
		top: 2em;
		left: 5em;
		right: 5em;
		border: 8px solid var(--primary-light);
		padding: 1em 4em 2em 4em;
		background-color: #fff;
		box-shadow: 0 0 1em 0 #333;
	}
	textarea {
		width: 100%;
		height: calc(100vh - 12rem); /* all the viewport minus the padding and text stuff */
	}
	fieldset {
		border: none;
		padding: 0;
		margin: 0;
	}
</style>

<!--
TODO listen for any window click that's outside the panel and close
-->

{#if filePromise}
	<div class="editor-scrim" on:click={scrimClickHandler}>
		<div class="editor-modal-panel" bind:this={panel}>
			{#await filePromise}
				<p>Loading...</p>
			{:then response}
				<fieldset disabled={saving}>
					<div style="display: flex; align-items: baseline;">
						<p style="flex-grow: 1;">
							<strong>Folder:</strong> <code>{$selectedFile.folder}</code>
							<br>
							<strong>File:</strong> <code>{$selectedFile.file}</code>
						</p>
						<button on:click={() => { $selectedFile = null; panelOpen = false }} style="margin-right: 1em; width: 8rem;">
							Cancel
						</button>
						<button disabled={previousContents === contents} on:click={() => saveFile()} style="width: 8rem;">
							{#if saving}
								Saving...
							{:else}
								Save
							{/if}
						</button>
					</div>
					<textarea
						name="contents"
						id="editor-panel-contents"
						value={response.contents}
						on:input={event => contents = event.target.value}
					/>
				</fieldset>
			{/await}
		</div>
	</div>
{/if}
