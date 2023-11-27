/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager from '@/game/classes/GameManager';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import settingService from '@/services/setting.service';
import wait from './wait';

/**
 * @description Replay options
 */
export interface ReplayOptions {
	/**
	 * @description Game
	 */
	game: Game;
	/**
	 * @description Actions
	 */
	actions: GameAction[];
	/**
	 * @description On game state change
	 * @param gameState - Game state
	 * @returns Void
	 */
	onGameStateChange?: (gameState: any) => void;
	/**
	 * @description On actions change
	 * @param actions - Actions
	 * @returns Void
	 */
	onActionsChange?: (actions: GameAction[]) => void;
}

/**
 * @description Replay state
 */
export const replayState = {
	/**
	 * @description Playing
	 */
	playing: false,
};

/**
 * @description Replay
 * @param options - Options
 */
export default async function replay({ game, actions, onGameStateChange, onActionsChange }: ReplayOptions) {
	// Set replaying state to true
	replayState.playing = true;

	const delayTime = settingService.replayDelay;

	const gameState = new GameManager(game.field!, game.num_of_turns);
	const currentActions: GameAction[] = [];

	for (let i = 0; i < actions.length && replayState.playing; i++) {
		const action = actions[i];

		if (action.turn === actions[i + 1]?.turn) {
			continue;
		}

		currentActions.push(action);
		gameState.addActions(currentActions);

		onGameStateChange?.(gameState.toObject());
		onActionsChange?.(currentActions);

		await wait(delayTime);
	}

	// Set replaying state to false
	replayState.playing = false;
}
