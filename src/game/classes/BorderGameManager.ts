import { buildDestroyActionParams } from '@/constants';
import { ActionDto } from '@/services';
import { CraftsmenPosition, GameManager, Position } from '.';
import { IBorderGameManager } from '../interfaces';

/**
 * @description Border game manager
 * @extends GameManager
 * @implements IBorderGameManager
 */
export default class BorderGameManager extends GameManager implements IBorderGameManager {
	protected override getNextCraftsmenAction(craftsmen: CraftsmenPosition): ActionDto {
		const buildAction = this.getCraftsmenBuildAction(craftsmen);
		if (buildAction) return buildAction;

		// If there is a move action, return it
		const moveAction = this.getCraftsmanMoveAction(craftsmen);
		if (moveAction) return moveAction;

		return {
			craftsman_id: craftsmen.id,
			action: 'STAY',
		};
	}

	/**
	 * @description Get move action for craftsmen
	 * @param craftsmen - Craftsman position
	 */
	private getCraftsmanMoveAction(craftsmen: CraftsmenPosition): ActionDto | null {
		const positions = craftsmen.x1xh1ywy(this.width, this.height);

		// Initial min index and minInstance
		let minIndex = 0;
		let minDistance = Infinity;

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			const distance = pos.distance(craftsmen);

			// If distance is greater than min distance, continue
			if (distance >= minDistance) continue;

			// Else if distance is equal to min distance, check if it is better
			minIndex = i;
			minDistance = distance;
		}

		const pos = positions[minIndex];

		const moveActions = craftsmen.getNextActionsToGoToPosition(pos);

		for (const action of moveActions) {
			if (!this.canCrafsmenDoAction(craftsmen, action)) continue;

			return action;
		}

		return null;
	}

	/**
	 * @description Get build action for craftsmen
	 * @param craftsmen - Craftsman position
	 * @returns Action
	 */
	private getCraftsmenBuildAction(craftsmen: CraftsmenPosition): ActionDto | null {
		const nears = craftsmen.topRightBottomLeft();

		// If there is a build action, return it
		for (let i = 0; i < nears.length; i++) {
			if (!this.willBuildWall(nears[i])) continue;
			return {
				craftsman_id: craftsmen.id,
				action: 'BUILD',
				action_param: buildDestroyActionParams[i],
			};
		}

		return null;
	}

	/**
	 * @description Check if craftsmen can do action
	 * @param pos - Position
	 * @returns True if can do action
	 */
	private willBuildWall(pos: Position): boolean {
		if (pos.x === 0 || pos.y === 0) return true;
		if (pos.x === this.width - 1 || pos.y === this.height - 1) return true;

		return false;
	}
}
