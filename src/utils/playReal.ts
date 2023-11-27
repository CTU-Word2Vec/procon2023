import { EGameMode, EWallSide } from '@/game/enums';
import IGameStateData from '@/game/interfaces/IGameStateData';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService from '@/services/player.service';
import { message } from 'antd';
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
}: PlayRealOptions) {
	// Set playing state to true
	playRealState.playing = true;

	const now = new Date();
	const startTime = new Date(game.start_time);

	let nextTurn = side === 'A' ? 2 : 1;

	if (now.getTime() >= startTime.getTime()) {
		const { cur_turn } = await playerService.getGameStatus(game.id);

		nextTurn = cur_turn;

		if (side === 'A' && nextTurn % 2 !== 0) {
			nextTurn++;
		}
	} else {
		const waitTime = Math.max(0, startTime.getTime() - now.getTime());

		onWaitTimeChange?.(waitTime);
		await wait(waitTime);
		onWaitTimeChange?.(0);
	}

	onShowCountDownChange?.(true);

	const gameManager = createGameManager(game.field, game.num_of_turns, gameMode);

	const actions = await playerService.getGameActions(game.id);

	gameManager.addActions(actions);

	onGameStateChange(gameManager.toObject());

	for (let i = 0; i <= game.num_of_turns && playRealState.playing; i++) {
		const actions = await playerService.getGameActions(game.id);

		const { cur_turn } = await playerService.getGameStatus(game.id);

		onGameActionsChange(actions);
		gameManager.addActions(actions);
		onGameStateChange(gameManager.toObject());

		if ((side === 'A' && cur_turn % 2 !== 0) || (side === 'B' && cur_turn % 2 === 0)) {
			playerService
				.createAction(game.id, {
					turn: cur_turn + 1,
					actions: gameManager.getNextActions(side),
				})
				.catch((error) => message.error(error.message));
		}

		const { remaining } = await playerService.getGameStatus(game.id);

		await wait(remaining * 1000);
	}

	onShowCountDownChange?.(false);

	// Set playing state to false
	playRealState.playing = false;
}
