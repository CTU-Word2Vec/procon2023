import { ActionDto } from '@/services';
import { IGameManager } from '.';
import { EWallSide } from '../enums';

/**
 * @description Border game manager
 */
export default interface IBorderGameManager extends IGameManager {
	/**
	 * @description Get next actions
	 * @param side - Wall side
	 * @returns List of actions
	 * @async
	 */
	getNextActionsAsync(side: EWallSide): Promise<ActionDto[]>;
}
