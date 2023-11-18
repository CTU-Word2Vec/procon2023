import { IPosition, Position } from './Position';

export type EWallSide = 'A' | 'B';

export interface IWallPosition extends IPosition {
	side: EWallSide;
}

export class WallPosition extends Position implements IWallPosition {
	public side: EWallSide;

	constructor(x: number, y: number, side: EWallSide) {
		super(x, y);
		this.side = side;
	}
}
