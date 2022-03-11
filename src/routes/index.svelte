<script>
	import { onMount } from 'svelte'
	import { DEFAULT_EXTENSIONS } from '$lib/variables.js'
	import { configuration, fileDetails } from '$lib/browser/stores.js'
	import { post } from '$lib/browser/post.js'
	import { toPointer } from 'pointer-props'

	let selectedDirectory = []
	let extensions = ''
	let saving
	let shouldFetchConfiguration = true

	let dirsPromise
	const fetchDirs = () => fetch('/api/folders', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ dirParts: selectedDirectory }),
	}).then(r => r.json())

	onMount(() => {
		const interval = setInterval(() => {
			if (shouldFetchConfiguration) {
				shouldFetchConfiguration = false
				fetch('/api/configuration')
					.then(r => r.json())
					.then(body => {
						$configuration.folders = { ...body.folders }
						for (const folder in $configuration.folders) {
							if ($configuration.folders[folder].status !== 'loaded' && $configuration.folders[folder].status !== 'error') shouldFetchConfiguration = true
						}
					})
			}
		}, 500)
		return () => clearInterval(interval)
	})

	const patch = operations => post('/api/configuration', operations)
		.catch(error => {
			console.error('There was an error updating the configuration!', error)
		})

	const addFolder = (folder, extensions) => patch([ {
		op: 'add',
		path: toPointer([ 'folders', folder ]),
		value: { extensions },
	} ])

	const removeFolder = folder => patch([ {
		op: 'remove',
		path: toPointer([ 'folders', folder ]),
	} ])

	const reloadFiles = () => fetch('/api/files')
		.then(r => r.json())
		.then(updatedFileData => {
			$fileDetails = updatedFileData
			saving = false
		})

	const adder = () => {
		saving = true
		let ext = extensions && extensions
			.split(',')
			.map(e => e.trim().toLowerCase().replace(/^\*\./, ''))
		if (!ext.length) ext = undefined
		addFolder('/' + selectedDirectory.join('/'), ext)
			.then(updated => {
				$configuration = updated
				selectedDirectory = []
				dirsPromise = undefined
			})
			.then(reloadFiles)
	}
	const remover = folder => {
		saving = true
		removeFolder(folder)
			.then(updated => {
				$configuration = updated
			})
			.then(reloadFiles)
	}
</script>

<svelte:head>
	<title>Configure</title>
</svelte:head>

<style>
	.content {
		max-width: 1024px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	ul.existing li {
		padding: 0.5em;
		background-color: var(--primary-bg);
		margin-bottom: 0.6em;
		display: flex;
		align-items: center;
	}
	button {
		padding: 0.2em 0.8em;
	}
	button.remove {
		margin-right: 1em;
	}
	input {
		/* 2x padding, plus 2x pixel border */
		width: calc(100% - 1.6em - 4px);
		padding: 0.2em 0.8em;
	}
	label {
		display: block;
	}
	.wide {
		flex-grow: 1;
	}
	#extensions {
		width: 8em;
	}
	.value {
		flex-grow: 1;
	}
	.value code {
		width: 100%;
		display: inline-block;
		padding: 0 1em;
	}
	.extension {
		margin-left: 2em;
	}
	.extension code, .wide code {
		padding: 0.4em 1em;
		border-radius: 0.3em;
		background-color: var(--info-bg);
	}
	.selected-path {
		display: flex;
		align-items: end;
	}
	.wide code {
		padding: 0.5em 1em;
		display: inline-block;
		width: calc(100% - 3em);
	}
	.selecting {
		background-color: var(--primary-bg);
		padding: 0.3em 1em;
	}
	.selecting li {
		padding: 0.3em 0;
	}
	.selecting p {
		margin-bottom: 0.5em;
		border-bottom: 1px solid var(--primary-highlight)
	}
</style>

<div class="content">
	<h2>Folders</h2>
	<p>
		These are the paths and file extensions used to scan folders for Markdown files and metadata.
	</p>
	<p>
		If you don't set a file extension (it's a comma separated list) it'll use <code>md</code> by default.
	</p>
	<fieldset disabled={saving}>
		<ul class="existing">
			{#each Object.keys($configuration?.folders || {}) as folder}
				<li>
					<button class="remove" on:click={() => remover(folder)} disabled={$configuration.folders[folder] === 'removing'}>
						Remove
					</button>
					<span class="value">
						<code>{folder}</code>
					</span>
					<span class="extension">
						<code>{($configuration.folders[folder].extensions || DEFAULT_EXTENSIONS).map(ext => `*.${ext}`).join(',')}</code>
					</span>
				</li>
			{/each}
		</ul>
	</fieldset>
</div>

<div class="content" style="padding-top: 0;">
	<fieldset disabled={saving}>
		{#if dirsPromise}
			<div class="selecting">
				{#if selectedDirectory}
					<div class="selected-path">
						<div class="wide">
							Selected Folder
							<br>
							<code>
								/{selectedDirectory.join('/')}
							</code>
						</div>
						<div style="margin-right: 1em;">
							<label for="extensions">
								Extensions
							</label>
							<input
								id="extensions"
								bind:value={extensions}
								type="text"
								placeholder="md, txt"
							>
						</div>
						<button class="add" on:click={adder}>
							Add Folder
						</button>
					</div>
				{/if}
				<p>Folders</p>
				{#await dirsPromise}
					Loading dirs...
				{:then dirs}
					<ul>
						{#if selectedDirectory.length}
							<li>
								<button on:click={() => { selectedDirectory.pop(); selectedDirectory = [ ...selectedDirectory ]; dirsPromise = fetchDirs() }}>
									...
								</button>
							</li>
						{/if}
						{#each dirs as dir}
							<li>
								<button on:click={() => { selectedDirectory = [ ...selectedDirectory, dir ]; dirsPromise = fetchDirs() }}>
									{dir}
								</button>
							</li>
						{/each}
					</ul>
				{:catch error}
					<strong>Error Loading Directories</strong>
					<pre>{JSON.stringify(error, undefined, 4)}</pre>
				{/await}
			</div>
		{:else}
			<button on:click={() => dirsPromise = fetchDirs()}>
				Add Folder
			</button>
		{/if}
	</fieldset>
</div>
