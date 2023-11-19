/* eslint-disable @typescript-eslint/no-explicit-any */
import CaroGameManager from '@/game/CaroGameManager';
import { GameStateData } from '@/game/GameManager';
import { EWallSide } from '@/game/WallPosition';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService from '@/services/player.service';
import { message } from 'antd';
import wait from './wait';

export interface playRealOptions {
	game: Game;
	side: EWallSide;
	onGameStateChange: (gameState: GameStateData) => void;
	onGameActionsChange: (gameActions: GameAction[]) => void;
}

export default async function playReal({ game, side, onGameStateChange, onGameActionsChange }: playRealOptions) {
	try {
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
			await wait(Math.max(0, startTime.getTime() - now.getTime()));
		}

		const gameManager = new CaroGameManager(game.field);

		const actions = await playerService.getGameActions(game.id);

		gameManager.addActions(actions);

		onGameStateChange(gameManager.getData());

		for (let i = 0; i <= game.num_of_turns; i++) {
			const actions = await playerService.getGameActions(game.id);

			const { cur_turn } = await playerService.getGameStatus(game.id);

			gameManager.addActions(actions);
			onGameStateChange(gameManager.getData());
			onGameActionsChange(actions.reverse());

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
	} catch (error: any) {
		message.error(error.message);
	}
}
