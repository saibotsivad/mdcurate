<script>
	import ContentEditable from '$lib/browser/ContentEditable.svelte'
	import { writable } from 'svelte/store'
	import PanelClick from '$lib/browser/PanelClick.svelte'
	import { bulkEditorFiles, fileDetails } from '$lib/browser/stores.js'
	import lodash from 'lodash'
	import { post } from '$lib/browser/post.js'

	// We know this isn't cyclic, but if we put the statement in the `subscribe`
	// it'll get flagged as such and won't compile, so we pull it out to confuse
	// the linter.
	const clear = () => $bulkEditorFiles = null

	$: panelOpenStore = writable($bulkEditorFiles)
	$: {
		panelOpenStore.subscribe(isOpen => {
			if (!isOpen) clear()
		})
	}

	let showExamples
	const example1 = `$metadata.categories = $metadata.categories
	.split(',')
	.map(s => s.trim())`
	const example2 = `$metadata.categories = $metadata.categories
	.split(',')
	.map(s => s.trim())
	.join(', ')`
	const example3 = `$metadata.categories = $metadata.categories
	.split(',')
	.map(s => s
		.split('/')
		.map(w => _.startCase(w.trim()))
		.join('/')
	)
	.join(', ')`
	const example4 = `if ($metadata.categories?.toLowerCase().includes('fruit')) {
	$metadata.grammarian = $metadata.grammarian || []
	$metadata.grammarian.push('Ambrose Bierce')
}`

	let demoData = '{\n  "categories": "book, physiology /Development,  Fruit/citrus"\n}'
	let runnable = example1
	let runnableErrors = false

	let outputMetadata = ''
	$: {
		let data
		try {
			data = JSON.parse(demoData)
		} catch (error) {
			outputMetadata = 'ERROR: The demo data is not valid JSON.'
		}
		if (typeof data === 'object' && runnable) {
			try {
				const runner = new Function('$metadata', '_', `${runnable}; return $metadata`)
				outputMetadata = JSON.stringify(runner(data, lodash), undefined, 2)
				runnableErrors = false
			} catch (error) {
				runnableErrors = true
				outputMetadata = `There is an error in your function code:\n\n${error.name}: ${error.message}`
			}
		}
	}

	let runningTransform
	const runTransform = () => {
		runningTransform = true
		post('/api/transform', { runnable, files: $bulkEditorFiles })
			.then(() => fetch('/api/files'))
			.then(r => r.json())
			.then(updatedFileData => {
				$fileDetails = updatedFileData
				runningTransform = false
				$bulkEditorFiles = null
			})
			.catch(error => {
				console.error('Error while POSTing the transform.', error)
			})
	}
</script>

<style>
	code.inline {
		padding: 0.2em 0.3em;
	}
	button.transform {
		padding: 0.5em 1em;
		background-color: var(--primary-bg);
	}
	button.transform:hover:enabled {
		background-color: var(--primary-light);
	}
	p.header {
		margin-bottom: 0.3em;
		border-top: 2px solid var(--primary-bg);
		padding-top: 1em;
	}
	.examples {
		border: 2px solid var(--primary-bg);
		padding: 1em 2em;
		margin-top: 1em;
	}
</style>

<PanelClick {panelOpenStore}>
	<h3>
		Bulk Transform
	</h3>
	<p>Run a function on each file, transforming the metadata for all of them.</p>
	<p>Edit the demo data and function code to test the output before you apply the transformation.</p>

	<p class="header">
		<strong>Function Code</strong>
		<button on:click={() => showExamples = !showExamples}>
			{#if showExamples}
				Hide
			{:else}
				Show
			{/if}
			Examples
		</button>
	</p>
	{#if showExamples}
		<div class="examples">
			<p>
				Convert the <code class="inline">categories</code> metadata into a list.
				<button on:click={() => runnable = example1}>Use</button>
			</p>
			<pre>{example1}</pre>

			<p>
				Clean up white-space between the commas of the <code class="inline">categories</code> value.
				<button on:click={() => runnable = example2}>Use</button>
			</p>
			<pre>{example2}</pre>

			<p>
				Clean up white-space between the commas and the forward-slash separator, and use
				<a href="https://lodash.org" target="_blank">lodash</a> to clean up the casing.
				<button on:click={() => runnable = example3}>Use</button>
			</p>
			<pre>{example3}</pre>

			<p>
				Conditional logic: if the <code class="inline">categories</code> is a string with the word
				<code class="inline">fruit</code> (case-ignored), add a new metadata property.
				<button on:click={() => runnable = example4}>Use</button>
			</p>
			<pre>{example4}</pre>
		</div>
	{/if}
	<p>Properties available in the function:</p>
	<ul>
		<li>
			<code class="inline">$metadata</code> This is the property containing the document metadata. Mutate
			it and set it to whatever values you want.
		</li>
		<li>
			<code class="inline">_</code> This gives you access to the <a href="https://lodash.com/" target="_blank">lodash</a> library.
		</li>
	</ul>
	<ContentEditable bind:value={runnable} label="JavaScript" lang="javascript" />
	<pre>{JSON.stringify(runnable)}</pre>

	<p class="header">
		<strong>Test it Out</strong>
	</p>
	<div style="display: flex">
		<div style="width: 50%; padding-right: 1em;">
			<p>Edit this to be an example metadata object.</p>
			<ContentEditable bind:value={demoData} label="JSON" lang="json" />
		</div>
		<div style="width: 50%; padding-left: 1em;">
			<p>This will be the output.</p>
			<ContentEditable bind:value={outputMetadata} readonly label="JSON" lang="json" />
		</div>
	</div>

	<p class="header"><strong>Confirm</strong></p>
	<p>If this transform looks good to you, apply it to all selected files.</p>
	<p>
		<button class="transform" disabled={!runnable || runnableErrors || runningTransform} on:click={runTransform}>
			Apply Transform to {$bulkEditorFiles.length} Files
		</button>
		{#if runningTransform}
			Updating files...
		{/if}
	</p>
</PanelClick>
