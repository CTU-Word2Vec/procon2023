import { EGameMode } from '@/game/enums';
import { EWallSide } from '@/game/enums/EWallSide';
import IGameStateData from '@/game/interfaces/IGameStateData';
import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import settingService from '@/services/setting.service';
import { createGameManager } from '.';
import wait from './wait';

/**
 * @description Play test options
 */
export interface PlayTestOptions {
	/**
	 * @description Number of turns
	 */
	numberOfTurns: number;
	/**
	 * @description Field
	 */
	field: Field;
	/**
	 * @description Side A mode
	 */
	sideAMode?: EGameMode;
	/**
	 * @description Side B mode
	 */
	sideBMode?: EGameMode;
	/**
	 * @description On game state change
	 * @param gameState - Game state
	 * @returns - Void
	 */
	onGameStateChange: (gameState: IGameStateData) => void;
	/**
	 * @description On game actions change
	 * @param gameActions - Game actions
	 * @returns - Void
	 */
	onGameActionsChange: (gameActions: GameAction[]) => void;
}

/**
 * @description Play test
 * @param options - Options
 */
export default async function playTest({
	numberOfTurns,
	field,
	sideAMode = 'Caro',
	sideBMode = 'Border',
	onGameStateChange,
	onGameActionsChange,
}: PlayTestOptions) {
	const delayTime = settingService.replayDelay;

	const actions: GameAction[] = [];
	const sideAgameManager = createGameManager(field, numberOfTurns, sideAMode);
	const sideBgameManager = createGameManager(field, numberOfTurns, sideBMode);

	const gameManagerMap = {
		A: sideAgameManager,
		B: sideBgameManager,
	};

	for (let i = 1; i <= numberOfTurns; i++) {
		const turnOf: EWallSide = i % 2 !== 0 ? 'A' : 'B';

		const action = (await gameManagerMap[turnOf].getNextActionsAsync(turnOf)) as unknown as Action[];

		actions.push({
			actions: action,
			turn: i + 1,
			created_time: new Date().toISOString(),
			game_id: 0,
			id: i,
			team_id: i % 2,
		});

		onGameActionsChange(actions);

		sideAgameManager.addActions(actions);
		sideBgameManager.addActions(actions);

		onGameStateChange(sideAgameManager.toObject());

		await wait(delayTime);
	}
}
