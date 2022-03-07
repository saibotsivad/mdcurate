export const post = async (url, body) => fetch(url, {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify(body),
}).then(response => response.json())
