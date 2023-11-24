import { ActionDto } from '@/services/player.service';
import { EWallSide } from '../enums/EWallSide';
import IGameManager from './IGameManager';

/**
 * @description Caro game manager interface
 * @extends {IGameManager}
 */
export default class CaroGameManager extends IGameManager {
	/**
	 * @description Get list of next actions
	 * @param side - Side of the player
	 * @returns Next actions
	 */
	getNextActions(side: EWallSide): ActionDto[];

	/**
	 * @description Get list of next actions
	 * @param side - Side of the player
	 * @returns Next actions
	 */
	async getNextActionsAsync(side: EWallSide): Promise<ActionDto[]>;
}
