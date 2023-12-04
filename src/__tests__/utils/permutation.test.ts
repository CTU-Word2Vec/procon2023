import generatePermutation from '@/utils/permutation';
import { describe, expect, it } from 'vitest';

describe('permutation', () => {
	it('Should be able to generate permutations', () => {
		const array = [1, 2, 3];

		const permutations = generatePermutation(array);

		expect(permutations.length).toEqual(6);
		expect(permutations).toEqual([
			[1, 2, 3],
			[1, 3, 2],
			[2, 1, 3],
			[2, 3, 1],
			[3, 1, 2],
			[3, 2, 1],
		]);
	});
});
