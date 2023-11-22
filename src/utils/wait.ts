export default function wait(ms: number = 1000): Promise<string> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`Waited ${ms}ms`);
		}, ms);
	});
}
