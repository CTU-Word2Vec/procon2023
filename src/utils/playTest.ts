/* eslint-disable @typescript-eslint/no-explicit-any */
import CaroGameManager from '@/game/CaroGameManager';
import { GameStateData } from '@/game/GameManager';
import { EWallSide } from '@/game/WallPosition';
import Action from '@/models/Action';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import { message } from 'antd';
import wait from './wait';

export interface playTestOptions {
	game: Game;
	onGameStateChange: (gameState: GameStateData) => void;
	onGameActionsChange: (gameActions: GameAction[]) => void;
}

export default async function playTest({ game, onGameStateChange, onGameActionsChange }: playTestOptions) {
	try {
		const actions: GameAction[] = [];

		const gameManager = new CaroGameManager(game.field);

		for (let i = 1; i <= game.num_of_turns; i++) {
			const turnOf: EWallSide = i % 2 !== 0 ? 'A' : 'B';

			const action = gameManager.getNextActions(turnOf) as unknown as Action[];

			actions.push({
				actions: action,
				turn: i + 1,
				created_time: new Date().toISOString(),
				game_id: game.id,
				id: i,
				team_id: i % 2,
			});

			gameManager.addActions(actions);
			onGameStateChange(gameManager.getData());
			onGameActionsChange(actions.reverse());
			await wait(10);
		}
	} catch (error: any) {
		message.error(error.message);
	}
}
