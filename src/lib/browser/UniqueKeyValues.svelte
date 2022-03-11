<script>
	import UniqueKeyValueType from '$lib/browser/UniqueKeyValueType.svelte'

	export let key // e.g. 'tags'
	export let fileData

	$: metadataMap = fileData.metadataMap[key] || {}
</script>

<UniqueKeyValueType
	{metadataMap}
/>

<UniqueKeyValueType
	type="__number"
	{metadataMap}
/>

<UniqueKeyValueType
	type="__array"
	{metadataMap}
/>

<UniqueKeyValueType
	type="__object"
	{metadataMap}
/>
