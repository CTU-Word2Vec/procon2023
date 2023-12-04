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
 * @description Play test state
 */
export const playTestState = {
	/**
	 * @description Playing
	 */
	playing: false,
};

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
	// Set playing state to true
	playTestState.playing = true;

	const delayTime = settingService.replayDelay;

	const actions: GameAction[] = [];
	const sideAgameManager = createGameManager(field, numberOfTurns, sideAMode); // * Khởi tạo GameManager cho Side A
	const sideBgameManager = createGameManager(field, numberOfTurns, sideBMode); // * Khởi tạo GameManager cho Side B

	const gameManagerMap = {
		A: sideAgameManager, // * Map GameManager cho Side A
		B: sideBgameManager, // * Map GameManager cho Side B
	};

	for (let i = 1; i <= numberOfTurns && playTestState.playing; i++) {
		const turnOf: EWallSide = i % 2 !== 0 ? 'A' : 'B'; // * Lấy lượt đi của Side A hoặc Side B

		const start = new Date().getTime();

		const action = (await gameManagerMap[turnOf].getNextActionsAsync(turnOf)) as unknown as Action[];

		const end = new Date().getTime();

		console.log(`[${gameManagerMap[turnOf].name}] Turn ${i} took ${end - start}ms`);

		actions.push({
			//! Hack
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

	// Set playing state to false
	playTestState.playing = false;
}
