import { ActionDto } from '@/services';
import { CraftsmenPosition } from '.';
import { IAStarGameManager } from '../interfaces';
import GameManager from './GameManager';

type AStartReturn = {
	action: ActionDto;
	totalScore: number;
};

/**
 * @description Start game manager
 * @extends GameManager
 * @implements IAStarGameManager
 */
export default class AStarGameManager extends GameManager implements IAStarGameManager {
	protected override getNextCraftsmenAction(craftsmen: CraftsmenPosition): ActionDto {
		return this.aStart(craftsmen, craftsmen.getStayAction()).action;
	}

	private aStart(
		craftmen: CraftsmenPosition,
		action: ActionDto,
		currentDepth: number = 0,
		maxDepth: number = 5,
	): AStartReturn {
		if (currentDepth === maxDepth) {
			return {
				action,
				totalScore: this.scores[craftmen.side].total,
			};
		}

		const availableActions = this.getRandomAvailableActions(craftmen);
		const futureActions: AStartReturn[] = [];

		for (const action of availableActions) {
			const gameManager = new AStarGameManager(this.toObject());
			gameManager.addActions([
				{
					actions: [
						{
							...action,
							action_id: 0,
							id: 0,
						},
					],
					created_time: new Date().toISOString(),
					game_id: this.id,
					id: 0,
					team_id: 0,
					turn: this.lastTurn + 1,
				},
			]);

			futureActions.push(gameManager.aStart(craftmen, action, currentDepth + 1, maxDepth));
		}

		return futureActions.sort((a, b) => b.totalScore - a.totalScore)[0];
	}
}
