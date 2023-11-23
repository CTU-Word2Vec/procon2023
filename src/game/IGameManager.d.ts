import GameAction from '@/models/GameAction';
import IBaseGameManager from './IBaseGameManager';
import IGameStateData from './IGameStateData';

/**
 * @description Game manager
 * @extends IBaseGameManager
 */
export default interface GameManager extends IBaseGameManager {
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
}
