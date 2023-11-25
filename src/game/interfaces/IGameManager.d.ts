import GameAction from '@/models/GameAction';
import { ActionDto } from '@/services';
import { EWallSide } from '../enums';
import IBaseGameManager from './IBaseGameManager';
import IGameStateData from './IGameStateData';

/**
 * @description Game manager
 * @extends IBaseGameManager
 */
export default interface IGameManager extends IBaseGameManager {
	/**
	 *
	 * @returns Game state data
	 */
	getData(): IGameStateData;

	/**
	 * @description Get position of craftsmen
	 * @param actions - List of actions
	 */
	addActions(actions: GameAction[]): void;

	/**
	 * @description Get next actions
	 * @param side - Side of team
	 * @returns List of actions
	 */
	getNextActions(side: EWallSide): ActionDto[];

	/**
	 * @description Get next actions
	 * @param side - Side of team
	 * @returns List of actions
	 * @async
	 */
	getNextActionsAsync(side: EWallSide): Promise<ActionDto[]>;
}
