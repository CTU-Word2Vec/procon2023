import CaroGameManager from '@/game/CaroGameManager';
import { EWallSide } from '@/game/EWallSide';
import IGameStateData from '@/game/IGameStateData';
import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import settingService from '@/services/setting.service';
import wait from './wait';

export interface PlayTestOptions {
	numberOfTurns: number;
	field: Field;
	onGameStateChange: (gameState: IGameStateData) => void;
	onGameActionsChange: (gameActions: GameAction[]) => void;
}

export default async function playTest({
	numberOfTurns,
	field,
	onGameStateChange,
	onGameActionsChange,
}: PlayTestOptions) {
	const delayTime = settingService.replayDelay;

	const actions: GameAction[] = [];
	const gameManager = new CaroGameManager(field, numberOfTurns);

	for (let i = 1; i <= numberOfTurns; i++) {
		const turnOf: EWallSide = i % 2 !== 0 ? 'A' : 'B';

		const action = (await gameManager.getNextActionsAsync(turnOf)) as unknown as Action[];

		actions.push({
			actions: action,
			turn: i + 1,
			created_time: new Date().toISOString(),
			game_id: 0,
			id: i,
			team_id: i % 2,
		});

		onGameActionsChange(actions);
		gameManager.addActions(actions);
		onGameStateChange(gameManager.getData());
		await wait(delayTime);
	}
}
