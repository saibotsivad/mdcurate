export const delay = async millis => new Promise(resolve => {
	setTimeout(() => {
		resolve()
	}, millis)
})

export const minimumDelay = (millis, promise) => {
	const wait = delay(millis)
	return promise
		.then(
			success => wait.then(() => success),
			failure => wait.then(() => Promise.reject(failure)),
		)
}
