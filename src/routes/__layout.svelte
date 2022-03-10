<script context="module">
	export async function load({ url }) {
		const [ initialConfiguration, initialFileDetails ] = await Promise.all([
			fetch(url.origin + '/api/configuration').then(r => r.json()),
			fetch(url.origin + '/api/files').then(r => r.json()),
		])
		return {
			props: { initialConfiguration, initialFileDetails },
		}
	}
</script>

<script>
	import Header from '$lib/browser/Header.svelte'
	import '../app.css'
	import { configuration, fileDetails } from '$lib/browser/stores.js'
	import { onMount } from 'svelte'

	export let initialConfiguration
	export let initialFileDetails

	let loaded
	onMount(() => {
		$configuration = initialConfiguration
		$fileDetails = initialFileDetails
		loaded = true
	})
</script>

{#if loaded}
	<Header />

	<main>
		<slot />
	</main>
{/if}
