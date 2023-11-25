import { buildDestroyActionParams } from '@/constants';
import { ActionDto } from '@/services';
import { CraftsmenPosition, GameManager, HashedType, Position } from '.';
import { EWallSide } from '../enums';
import { IBorderGameManager } from '../interfaces';

/**
 * @description Border game manager
 * @extends GameManager
 * @implements IBorderGameManager
 */
export default class BorderGameManager extends GameManager implements IBorderGameManager {
	protected override getNextCraftsmenAction(craftsmen: CraftsmenPosition): ActionDto {
		// If there is a destroy action, return it
		const destroyAction = this.getCrafsmenDestroyAction(craftsmen);
		if (destroyAction) return destroyAction;

		// If there is a build action, return it
		const buildAction = this.getCraftsmenBuildAction(craftsmen);
		if (buildAction) return buildAction;

		// If there is a move action, return it
		const moveAction = this.getCraftsmanMoveAction(craftsmen);
		if (moveAction) return moveAction;

		return craftsmen.getStayAction();
	}

	/**
	 * @description Get move action for craftsmen
	 * @param craftsmen - Craftsman position
	 */
	private getCraftsmanMoveAction(craftsmen: CraftsmenPosition): ActionDto | null {
		const positions = this.getPositionsWillGoto(craftsmen);

		for (const pos of positions) {
			const moveActions = craftsmen.getNextActionsToGoToPosition(pos);

			for (const action of moveActions) {
				this.goingTo.write(pos, pos);

				if (!this.canCrafsmenDoAction(craftsmen, action)) continue;

				return action;
			}
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

		for (let i = 0; i < nears.length; i++) {
			// If position is not valid, continue
			if (!this.willBuildWall(nears[i], craftsmen.side)) continue;

			this.goingTo.write(nears[i], nears[i]);
			return craftsmen.getBuildAction(buildDestroyActionParams[i]);
		}

		return null;
	}

	/**
	 * @description Get destroy action for craftsmen
	 * @param craftsmen - Craftsman position
	 * @returns Destroy action
	 */
	private getCrafsmenDestroyAction(craftsmen: CraftsmenPosition): ActionDto | null {
		const nears = craftsmen.topRightBottomLeft();

		// If there is a build action, return it
		for (let i = 0; i < nears.length; i++) {
			if (!this.hashedWalls.exist(nears[i])) continue;
			if (this.hashedWalls.read(nears[i])!.side === craftsmen.side) continue;
			if (this.goingTo.exist(nears[i])) continue;

			this.goingTo.write(nears[i], nears[i]);

			return craftsmen.getDestroyAction(buildDestroyActionParams[i]);
		}

		return null;
	}

	/**
	 * @description Check if craftsmen can do action
	 * @param pos - Position
	 * @returns True if can do action
	 */
	private willBuildWall(pos: Position, side: EWallSide): boolean {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedWalls.read(pos) && this.hashedWalls.read(pos)!.side === side) return false;

		if (pos.x === 0 || pos.y === 0) return true;
		if (pos.x === this.width - 1 || pos.y === this.height - 1) return true;

		return false;
	}

	/**
	 * @description Get craftsmen will goto positions
	 * @param craftmen - Craftsman position
	 * @returns List of positions
	 */
	private getPositionsWillGoto(craftmen: CraftsmenPosition): Position[] {
		const MAX_LOOP = 1000;

		const queue = craftmen.x1xh1ywy(this.width, this.height);
		const results: Position[] = [];
		const visited = new HashedType<boolean>();
		let loop = 0;

		while (queue.length) {
			if (loop > MAX_LOOP) break;
			loop++;

			const pos = queue.shift()!;

			// If position is visited, continue
			if (visited.exist(pos)) continue;
			// Else, mark it as visited
			visited.write(pos, true);

			if (this.goingTo.exist(pos)) continue;

			const nears = pos.topRightBottomLeft();

			const willBuildable = nears.some((near) => this.willBuildWall(near, craftmen.side));
			if (!willBuildable) continue;

			results.push(pos);

			queue.push(...nears);
		}

		return results.sort((a, b) => a.distance(craftmen) - b.distance(craftmen));
	}
}
