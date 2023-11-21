import { IPosition, Position } from './Position';

/**
 * @description Wall side
 */
export type EWallSide = 'A' | 'B';

/**
 * @description Wall position
 * @extends IPosition
 */
export interface IWallPosition extends IPosition {
	/**
	 * @description Wall side
	 */
	side: EWallSide;
}

/**
 * @description Wall position
 * @extends Position
 * @implements IWallPosition
 */
export class WallPosition extends Position implements IWallPosition {
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
