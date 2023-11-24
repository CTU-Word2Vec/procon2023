import { EWallSide } from '../enums/EWallSide';
import IPosition from './IPosition';

/**
 * @description Wall position
 * @extends IPosition
 */
export default interface IWallPosition extends IPosition {
	/**
	 * @description Wall side
	 */
	side: EWallSide;
}
