<script>
	import { page } from '$app/stores'
</script>

<header>
	<nav>
		<ul>
			<li class:active={$page.url.pathname === '/'}>
				<a href="/">Configure</a>
			</li>
			<li class:active={$page.url.pathname === '/curate'}>
				<a href="/curate">Curate</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		background-color: var(--primary-bg);
	}
	nav {
		display: flex;
		justify-content: center;
	}
	ul {
		position: relative;
		padding: 0;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
	}
	li {
		position: relative;
		border-bottom: 4px solid var(--primary-bg);
	}
	li.active {
		border-bottom-color: var(--primary-highlight);
	}
	li:hover {
		border-bottom-color: var(--primary-light);
	}
	a {
		display: inline-block;
		padding: 1em 3em;
		color: var(--primary-highlight);
		font-size: 1.2em;
		font-weight: bold;
		text-decoration: none;
	}
	a:hover {
		color: var(--primary-light);
	}
</style>
