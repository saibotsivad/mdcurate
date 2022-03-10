<script>
	import { post } from '$lib/browser/post.js'
	import { selectedFile, fileDetails } from '$lib/browser/stores.js'
	let panelOpen
	let panel
	let previousContents
	let contents
	let saving
	let showControlCharacters

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

	const escapeHandler = event => {
		if (event.keyCode === 27) close()
	}

	const saveFile = () => {
		saving = true
		post('/api/file', { action: 'write', ...$selectedFile, contents })
			.then(() => fetch('/api/files'))
			.then(r => r.json())
			.then(updatedFileData => {
				$fileDetails = updatedFileData
				close()
				saving = false
			})
	}

	const makeControlCharactersVisible = string => string
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/ /g, '<span class="char">⎵</span>')
		.replace(/\r\n/g, '\n') // just in case
		.replace(/\n/g, '<span class="char">¶</span><br>')
</script>

<svelte:window on:keyup={escapeHandler} />

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
	.preview {
		border: 1px solid #888;
		padding: 0.2em;
		font-family: monospace;
		line-break: anywhere;
		height: calc(100vh - 12rem);
		overflow-y: scroll;
	}
	:global(.preview .char) {
		color: #ef4848;
	}
</style>

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
							<br>
							<button style="margin-top: 0.6em;" on:click={() => showControlCharacters = !showControlCharacters}>
								{#if showControlCharacters}
									Hide
								{:else}
									Show
								{/if}
								Control Characters
							</button>
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
					{#if showControlCharacters}
						<div class="preview">
							{@html makeControlCharactersVisible(response.contents)}
						</div>
					{:else}
						<textarea
							name="contents"
							id="editor-panel-contents"
							value={response.contents}
							on:input={event => contents = event.target.value}
						/>
					{/if}
				</fieldset>
			{/await}
		</div>
	</div>
{/if}
