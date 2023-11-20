/* eslint-disable @typescript-eslint/no-explicit-any */
import CaroGameManager from '@/game/CaroGameManager';
import { GameStateData } from '@/game/GameManager';
import { EWallSide } from '@/game/WallPosition';
import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import { message } from 'antd';
import wait from './wait';

export interface playTestOptions {
	numberOfTurns: number;
	field: Field;
	onGameStateChange: (gameState: GameStateData) => void;
	onGameActionsChange: (gameActions: GameAction[]) => void;
}

export default async function playTest({
	numberOfTurns,
	field,
	onGameStateChange,
	onGameActionsChange,
}: playTestOptions) {
	const actions: GameAction[] = [];
	const gameManager = new CaroGameManager(field);

	try {
		for (let i = 1; i <= numberOfTurns; i++) {
			const turnOf: EWallSide = i % 2 !== 0 ? 'A' : 'B';

			const action = gameManager.getNextActions(turnOf) as unknown as Action[];

			actions.push({
				actions: action,
				turn: i + 1,
				created_time: new Date().toISOString(),
				game_id: 0,
				id: i,
				team_id: i % 2,
			});

			gameManager.addActions(actions);
			onGameStateChange(gameManager.getData());
			onGameActionsChange(actions);
			await wait(10);
		}
	} catch (error: any) {
		message.error(error.message);
	}
}
