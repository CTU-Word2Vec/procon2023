import { CraftsmenPosition } from '../classes';
import { EWallSide } from '../enums';
import IGameStateData from '../interfaces/IGameStateData';

/**
 * @description Base game manager interface
 */
export default class IBaseGameManager extends IGameStateData {
	/**
	 * @description Get position of craftsmen
	 * @param side - Side of team
	 * @returns List of craftsmen
	 */
	getCraftsmansBySide(side: EWallSide): CraftsmenPosition[];
}
