import IPriorityQueue, { IPriorityQueueResult } from '../interfaces/IPriorityQueue';

/**
 * @description Priority queue
 */
export default class PriorityQueue<T> implements IPriorityQueue<T> {
	/**
	 * @description The queue data
	 */
	protected queue: IPriorityQueueResult<T>[];

	/**
	 * @description Priority queue constructor
	 */
	constructor() {
		this.queue = [];
	}

	public enQueue(value: T, priority: number): void {
		if (this.isEmpty()) {
			this.queue.push({ value, priority });
			return;
		}

		let isPushed = false;

		for (let i = this.queue.length - 1; i >= 0; i--) {
			if (this.queue[i].priority < priority) {
				this.queue.splice(i + 1, 0, { value, priority });
				isPushed = true;
				break;
			}
		}

		if (!isPushed) {
			this.queue.unshift({ value, priority });
		}
	}

	public deQueue(): IPriorityQueueResult<T> {
		if (this.isEmpty()) throw new Error('Queue is empty');

		return this.queue.shift()!;
	}

	public isEmpty(): boolean {
		return this.queue.length === 0;
	}

	public front(): IPriorityQueueResult<T> {
		if (this.isEmpty()) throw new Error('Queue is empty');

		return this.queue[0];
	}
}
