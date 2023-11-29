/**
 * @description Priority queue result interface
 * @interface IPriorityQueue
 */
export interface IPriorityQueueResult<T> {
	/**
	 * @description The value
	 */
	value: T;
	/**
	 * @description The priority
	 */
	priority: number;
}

/**
 * @description Priority queue interface
 * @interface IPriorityQueue
 */
export default interface IPriorityQueue<T> {
	/**
	 * @description Insert value to end of queue
	 * @param value - The value
	 * @param priority - The priority
	 */
	enQueue(value: T, priority: number): void;

	/**
	 * @description Remove and return the first element of queue
	 * @returns - The first element of queue
	 */
	deQueue(): IPriorityQueueResult<T>;

	/**
	 * @description Check if queue is empty
	 * @returns - True if queue is empty, false otherwise
	 */
	isEmpty(): boolean;
}
