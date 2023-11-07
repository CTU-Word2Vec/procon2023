export default function wait(ms = 1000) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`Waited ${ms}ms`);
		}, ms);
	});
}
