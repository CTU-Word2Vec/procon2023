import { EGameMode, EWallSide } from '@/game/enums';
import IGameStateData from '@/game/interfaces/IGameStateData';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService from '@/services/player.service';
import { createGameManager } from '.';
import wait from './wait';

/**
 * @description Play real options
 */
export interface PlayRealOptions {
	/**
	 * @description Game
	 */
	game: Game;
	/**
	 * @description Side
	 */
	side: EWallSide;
	/**
	 * @description Game mode
	 */
	gameMode?: EGameMode;
	/**
	 * @description On game state change
	 * @param gameState - Game state
	 * @returns Void
	 */
	onGameStateChange: (gameState: IGameStateData) => void;
	/**
	 * @description On game actions change
	 * @param gameActions - Game actions
	 * @returns Void
	 */
	onGameActionsChange: (gameActions: GameAction[]) => void;
	/**
	 * @description On wait time change
	 * @param waitTime - Wait time
	 * @returns Void
	 */
	onWaitTimeChange?: (waitTime: number) => void;
	/**
	 * @description On show count down
	 * @param showCountDown - Show count down
	 * @returns Void
	 */
	onShowCountDownChange?: (showCountDown: boolean) => void;
	/**
	 * @description On post error
	 * @param error - Error
	 * @returns Void
	 */
	onPostError?: (error: Error) => void;
}

/**
 * @description Play real state
 */
export const playRealState = {
	/**
	 * @description Playing
	 */
	playing: false,
};

/**
 * @description Play real
 * @param options - Options
 */
export default async function playReal({
	game,
	side,
	gameMode = 'Caro',
	onWaitTimeChange,
	onShowCountDownChange,
	onGameStateChange,
	onGameActionsChange,
	onPostError,
}: PlayRealOptions) {
	// Set playing state to true
	playRealState.playing = true;

	const gameManager = createGameManager(game.field, game.num_of_turns, gameMode);

	const actions = await playerService.getGameActions(game.id);

	gameManager.addActions(actions);

	onGameStateChange(gameManager.toObject());

	const now = new Date().getTime();
	const startTime = new Date(game.start_time).getTime();

	let waitTime = 0;

	if (now >= startTime) {
		waitTime = game.time_per_turn * 1000 - ((now - startTime) % (game.time_per_turn * 1000));
	} else {
		waitTime = startTime - now;
	}

	onWaitTimeChange?.(waitTime);
	await wait(waitTime);
	onWaitTimeChange?.(0);

	onShowCountDownChange?.(true);

	for (; playRealState.playing; ) {
		const actions = await playerService.getGameActions(game.id);

		onGameActionsChange(actions);
		gameManager.addActions(actions);
		onGameStateChange(gameManager.toObject());

		const { cur_turn } = await playerService.getGameStatus(game.id);

		if (cur_turn > game.num_of_turns) break;

		if ((side === 'A' && cur_turn % 2 !== 0) || (side === 'B' && cur_turn % 2 === 0)) {
			playerService
				.createAction(game.id, {
					turn: cur_turn + 1,
					actions: await gameManager.getNextActionsAsync(side),
				})
				.catch((error) => onPostError?.(error));
		}

		const { remaining } = await playerService.getGameStatus(game.id);

		await wait(remaining * 1000);
	}

	// Set playing state to false
	playRealState.playing = false;
}
