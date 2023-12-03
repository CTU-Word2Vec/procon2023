import IBasePosition from '../interfaces/IBasePosition';

/**
 * @description Base position class
 * @implements IBasePosition
 */
export default class BasePosition implements IBasePosition {
	public x: number;
	public y: number;

	/**
	 * @description Base position constructor
	 * @param x - The x position
	 * @param y - The y position
	 * @example
	 * const pos = new BasePosition(1, 1);
	 */
	constructor(x: number, y: number) {
		this.x = Math.floor(x);
		this.y = Math.floor(y);
	}
}
