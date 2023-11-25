import { ActionDto } from '@/services';
import { CraftsmenPosition, GameManager } from '.';
import { EWallSide } from '../enums';
import { IBorderGameManager } from '../interfaces';

/**
 * @description Border game manager
 * @extends GameManager
 * @implements IBorderGameManager
 */
export default class BorderGameManager extends GameManager implements IBorderGameManager {
	public async getNextActionsAsync(side: EWallSide): Promise<ActionDto[]> {
		const actions: Promise<ActionDto>[] = [];

		for (const craftsmen of this.craftsmen) {
			if (craftsmen.side !== side) continue;

			const action = this.getNextCraftsmanActionAsync(craftsmen);
			actions.push(action);
		}

		return await Promise.all(actions);
	}

	/**
	 * @description Get next action for craftsmen
	 * @param craftsmen - Craftsman position
	 * @returns Action for craftsmen
	 */
	private async getNextCraftsmanActionAsync(craftsmen: CraftsmenPosition): Promise<ActionDto> {
		return this.getNextCraftsmanAction(craftsmen);
	}

	/**
	 * @description Get next action for craftsmen
	 * @param craftsmen - Craftsman position
	 * @returns Action for craftsmen
	 */
	private getNextCraftsmanAction(craftsmen: CraftsmenPosition): ActionDto {
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
		const positions = craftsmen.x0xh0ywy(this.width, this.height);

		let minIndex = 0;
		let minDistance = Infinity;

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			const distance = pos.distance(craftsmen);

			if (distance > minDistance) continue;

			minIndex = i;
			minDistance = distance;
		}

		const pos = positions[minIndex];

		return craftsmen.getNextActionsToGoToPosition(pos)[0];
	}
}
