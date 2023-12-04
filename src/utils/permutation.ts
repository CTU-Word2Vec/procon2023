export default function generatePermutation<T>(arr: T[]): T[][] {
	// Initialize array of arrays
	const resultArr: T[][] = [];

	// Base case
	if (arr.length === 0) return [];
	if (arr.length === 1) return [arr];

	// Recursive case
	for (let i = 0; i < arr.length; i++) {
		const currentElement = arr[i];

		const otherElements = arr.slice(0, i).concat(arr.slice(i + 1));
		const swappedPermutation = generatePermutation(otherElements);

		for (let j = 0; j < swappedPermutation.length; j++) {
			const finalSwappedPermutation = [currentElement].concat(swappedPermutation[j]);

			resultArr.push(finalSwappedPermutation);
		}
	}

	return resultArr;
}
