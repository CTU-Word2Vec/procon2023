import IBasePosition from './IBasePosition';

/**
 * @description Base position class
 * @implements {IBasePosition}
 */
export default class BasePosition implements IBasePosition {
	public x: number;
	public y: number;

	/**
	 * @description Base position constructor
	 * @param x - The x position
	 * @param y - The y position
	 */
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}
