<script context="module">
	export async function load({ url }) {
		const configuration = await fetch(url.origin + '/api/configuration').then(r => r.json())
		return {
			props: { configuration },
		}
	}
</script>

<script>
	import { onMount } from 'svelte'
	import StatusText from '$lib/browser/StatusText.svelte'
	import { addFolder, removeFolder } from '$lib/browser/configuration.js'
	import { DEFAULT_EXTENSIONS } from '$lib/variables.js'

	export let configuration

	let path = ''
	let extensions = ''
	let saving
	let shouldFetchConfiguration = true

	onMount(() => {
		const interval = setInterval(() => {
			if (shouldFetchConfiguration) {
				shouldFetchConfiguration = false
				fetch('/api/configuration')
					.then(r => r.json())
					.then(body => {
						configuration.folders = { ...body.folders }
						for (const folder in configuration.folders) {
							if (configuration.folders[folder].status !== 'loaded' && configuration.folders[folder].status !== 'error') shouldFetchConfiguration = true
						}
					})
			}
		}, 500)
		return () => clearInterval(interval)
	})

	const adder = () => {
		saving = true
		let ext = extensions && extensions
			.split(',')
			.map(e => e.trim().toLowerCase().replace(/^\*\./, ''))
		if (!ext.length) ext = undefined
		addFolder(path, ext)
			.then(updated => {
				configuration = updated
				saving = false
				path = ''
				shouldFetchConfiguration = true
			})
	}
	const remover = folder => {
		saving = true
		removeFolder(folder)
			.then(updated => {
				configuration = updated
				saving = false
				shouldFetchConfiguration = true
			})
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
	li {
		padding: 0.5em;
		background-color: var(--primary-bg);
		margin-bottom: 0.6em;
		display: flex;
		align-items: center;
	}
	li.add-folder {
		align-items: end;
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
	.add-folder div {
		margin-right: 1em;
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
	.status {
		padding: 0 1em;
	}
	.extension {
		padding: 0.3em 1em;
		border-radius: 0.3em;
		background-color: var(--info-bg);
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
	<ul>
		{#each Object.keys(configuration?.folders || {}) as folder}
			<li>
				<button class="remove" on:click={() => remover(folder)} disabled={configuration.folders[folder] === 'removing'}>
					Remove
				</button>
				<span class="value">
					<code>{folder}</code>
					<code class="extension">{(configuration.folders[folder].extensions || DEFAULT_EXTENSIONS).map(ext => `*.${ext}`).join(',')}</code>
				</span>
				<span class="status">
					<StatusText folder={configuration.folders[folder]} />
				</span>
			</li>
		{/each}
		<li class="add-folder">
			<div class="wide">
				<label for="folder">
					Folder Path
				</label>
				<input
					id="folder"
					bind:value={path}
					type="text"
					placeholder="/path/to/folder"
				>
			</div>
			<div>
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
		</li>
	</ul>
</div>

<div class="content">
	<h2>Metadata</h2>
	<p>Define specific properties in your metadata.</p>
</div>
