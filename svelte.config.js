import adapter from '@sveltejs/adapter-node'

const config = {
	kit: {
		adapter: adapter({
			out: 'dist',
		}),
	},
}

export default config
