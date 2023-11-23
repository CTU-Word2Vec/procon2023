import { EWallSide } from './EWallSide';
import IPosition from './IPosition';

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
