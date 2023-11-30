import PriorityQueue from '@/game/classes/PriorityQueue';
import { describe, expect, it } from 'vitest';

describe('PriorityQueue', () => {
	it('Should be initial', () => {
		const queue = new PriorityQueue();
		expect(queue.isEmpty()).toBeTruthy();
	});

	it('Should be able to add items', () => {
		const queue = new PriorityQueue<number>();
		queue.enQueue(3, 3);
		queue.enQueue(1, 1);
		queue.enQueue(2, 2);

		expect(queue.deQueue().priority).toEqual(1);
		expect(queue.deQueue().priority).toEqual(2);
		expect(queue.deQueue().priority).toEqual(3);
	});
});
