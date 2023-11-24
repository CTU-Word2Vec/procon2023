import { EWallSide } from '../enums/EWallSide';
import IWallPosition from '../interfaces/IWallPosition';
import Position from './Position';

/**
 * @description Wall position
 * @extends Position
 * @implements IWallPosition
 */
export default class WallPosition extends Position implements IWallPosition {
	public side: EWallSide;

	/**
	 * @description Wall position
	 * @param x - X position
	 * @param y - Y position
	 * @param side - Wall side
	 */
	constructor(x: number, y: number, side: EWallSide) {
		super(x, y);
		this.side = side;
	}
}
