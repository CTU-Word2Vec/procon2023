/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager from '@/game/GameManager';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import settingService from '@/services/setting.service';
import wait from './wait';

export interface ReplayOptions {
	game: Game;
	actions: GameAction[];
	onGameStateChange?: (gameState: any) => void;
	onActionsChange?: (actions: GameAction[]) => void;
}

export default async function replay({ game, actions, onGameStateChange, onActionsChange }: ReplayOptions) {
	const delayTime = settingService.replayDelay;

	const gameState = new GameManager(game.field!);
	const currentActions: GameAction[] = [];

	for (let i = 0; i < actions.length; i++) {
		const action = actions[i];

		if (action.turn === actions[i + 1]?.turn) {
			continue;
		}

		currentActions.push(action);
		gameState.addActions(currentActions);

		onGameStateChange?.(gameState.getData());
		onActionsChange?.(currentActions);

		await wait(delayTime);
	}
}
