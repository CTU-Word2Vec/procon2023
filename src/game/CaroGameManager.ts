import { EBuildDestryParam } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { CraftsmenPosition } from './CraftsmenPosition';
import GameManager from './GameManager';
import { HashedType } from './HashedType';
import { Position } from './Position';
import { EWallSide } from './WallPosition';

/**
 * @description Caro game manager
 * @extends GameManager
 */
export default class CaroGameManager extends GameManager {
	/**
	 * @description Get list of next actions
	 * @param side - Side of the player
	 * @returns Next actions
	 */
	public getNextActions(side: EWallSide): ActionDto[] {
		this.goingTo = new HashedType<Position>();
		// Initialize actions
		const actions: ActionDto[] = [];

		for (const craftmen of this.craftsmen) {
			// If the craftsman is not on the side of the player, skip
			if (craftmen.side !== side) continue;

			// Get next action for the craftsman and push it to the actions array
			const action = this.getNextCraftsmenAction(craftmen);
			actions.push(action);
		}

		this.goingTo = new HashedType<Position>();

		return actions;
	}

	/**
	 * @description Get list of next actions
	 * @param side - Side of the player
	 * @returns Next actions
	 */
	public async getNextActionsAsync(side: EWallSide): Promise<ActionDto[]> {
		this.goingTo = new HashedType<Position>();
		// Initialize actions
		const actions: Promise<ActionDto>[] = [];

		for (const craftmen of this.craftsmen) {
			// If the craftsman is not on the side of the player, skip
			if (craftmen.side !== side) continue;

			// Get next action for the craftsman and push it to the actions array
			const action = this.getNextCraftsmenActionAsync(craftmen);

			actions.push(action);
		}

		this.goingTo = new HashedType<Position>();

		return await Promise.all(actions);
	}

	/**
	 * @description Get next action for the craftsman
	 * @param craftmen - Craftsmen position
	 * @returns Next action for the craftsman
	 */
	private getNextCraftsmenAction(craftmen: CraftsmenPosition): ActionDto {
		// If the craftsman can destroy a wall, destroy it
		const destroyAction = this.getDestroyAction(craftmen);
		if (destroyAction) return destroyAction;

		// If the craftsman can go to the closest castle, go to it
		const gotoClosestCastleAction = this.gotoClosestCastleAction(craftmen);
		if (gotoClosestCastleAction) return gotoClosestCastleAction;

		// If the craftsman can build a wall, build it
		const buildAction = this.getBuildAction(craftmen);
		if (buildAction) return buildAction;

		// Get next position for the craftsman
		const pos = this.getNextPosition(craftmen);

		if (pos) {
			// If the craftsman can go to the position, go to it
			const nextActions = this.getActionToGoToPosition(craftmen, pos);
			if (nextActions) return nextActions;
		}

		// If the craftsman can not do anything, stay
		return {
			action: 'STAY',
			craftsman_id: craftmen.id,
		};
	}

	private async getNextCraftsmenActionAsync(craftmen: CraftsmenPosition): Promise<ActionDto> {
		return this.getNextCraftsmenAction(craftmen);
	}

	/**
	 * @description Get action to go to the position
	 * @param craftmen - Craftsmen position
	 * @returns
	 */
	private gotoClosestCastleAction(craftmen: CraftsmenPosition): ActionDto | null {
		// Get the closest castle, if it does not exist, return null
		const closestCastle = this.findClosestCastle(craftmen);
		if (!closestCastle) return null;

		// Mark the position as going to and get the action to go to the position
		this.goingTo.write(closestCastle, closestCastle);
		return this.getActionToGoToPosition(craftmen, closestCastle);
	}

	/**
	 * @description Get next position for the craftsman
	 * @param craftmen - Craftsmen position
	 * @returns Next position for the craftsman
	 */
	private getNextPosition(craftmen: CraftsmenPosition): Position | null {
		// Initialize positions array, use this like a queue
		const position = new Position(craftmen.x, craftmen.y);
		const positions: Position[] = [];
		positions.push(position);

		while (positions.length) {
			// Get the first position in the positions array and remove it from the array
			const pos = positions.shift() as Position;

			// If the position is not valid, continue
			if (!pos.isValid(this.width, this.height)) continue;
			// If the position is going to, continue
			if (this.goingTo.exist(pos)) continue;

			// If the can build a wall at the position, return the position
			const canBuild = !!this.getBuildActionParamFromPosition(pos, craftmen.side);
			if (canBuild) return pos;

			// Else, push the next positions to the positions array
			positions.push(...pos.upperLeftUpperRightLowerRightLowerLeft(), ...pos.topRightBottomLeft());
		}

		// If the craftsman can not go to any position, return null
		return null;
	}

	/**
	 * @description Get build action
	 * @param craftmen - Craftsmen position
	 * @returns Build action
	 */
	private getBuildAction(craftmen: CraftsmenPosition): ActionDto | null {
		// Get the build action from the position, if it does not exist, return null
		const actionParam = this.getBuildActionParamFromPosition(craftmen, craftmen.side);

		if (!actionParam) return null;

		return {
			craftsman_id: craftmen.id,
			action: 'BUILD',
			action_param: actionParam,
		};
	}

	/**
	 * @description Get action to go to the position
	 * @param pos - Position to build
	 * @param side - Side of the player
	 * @returns
	 */
	private getBuildActionParamFromPosition(pos: Position, side: EWallSide): EBuildDestryParam | null {
		// Get the positions around the position
		const positions = pos.topRightBottomLeft();
		const actionParams: EBuildDestryParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];

		for (let i = 0; i < positions.length; i++) {
			const position = positions[i];
			const param = actionParams[i];

			// If the craftsman can not build a wall at the position, continue
			if (!this.willBeBuild(position, side)) continue;

			return param;
		}

		// If the craftsman can not build a wall at any position, return null
		return null;
	}

	/**
	 * @description Check whether the craftsman can build a wall at the position
	 * @param pos - Position to build
	 * @param side - Side of the player
	 * @returns Whether the craftsman will be able to build a wall at the position
	 */
	private willBeBuild(pos: Position, side: EWallSide): boolean {
		// If the position is not valid, return false
		if (!this.canCraftsmenBuildWall(pos)) return false;

		// If position is at the end of the map, return true
		if (pos.x === 0 || pos.y === 0) return true;
		if (pos.x === this.width - 1 || pos.y === this.height - 1) return true;

		if (pos.x === 1 || pos.y === 1) return false;
		if (pos.x === this.width - 2 || pos.y === this.height - 2) return false;

		if (this.hashedSide.read(pos) === side) return false;

		// Get the positions around the position
		const [top, right, bottom, left, upperLeft, upperRight, lowerLeft, lowerRight] = pos.allNears();

		const buildPairs = [
			[upperLeft, upperRight],
			[lowerLeft, lowerRight],
			[upperLeft, lowerLeft],
			[upperRight, lowerRight],
		];

		const noBuildPairs = [
			[top, left],
			[left, bottom],
			[bottom, right],
			[right, top],
		];

		for (const positions of buildPairs) {
			if (positions.every((pos) => this.hashedWalls.read(pos)?.side === side)) return true;
		}

		for (const positions of noBuildPairs) {
			if (positions.every((pos) => this.hashedWalls.read(pos)?.side === side)) return false;
		}

		return true;
	}

	/**
	 * @description Find the closest castle from the craftsman
	 * @param craftsmen - Craftsmen position
	 * @returns Closest castle
	 */
	private findClosestCastle(craftsmen: CraftsmenPosition): Position | null {
		// Initialize min distance and closest castle
		let min = Infinity;
		let closestCastle: Position | null = null;

		for (const castle of this.castles) {
			// If have already gone to the castle, continue
			if (this.goingTo.exist(castle)) continue;
			// If the castle is the same side with the craftsman, continue
			if (this.hashedCraftmens.exist(castle) && !craftsmen.equals(castle)) continue;
			// If the castle is the same side with the craftsman, continue
			if (this.hashedSide.read(castle) === craftsmen.side) continue;
			// If the craftsman can not build or destroy at the castle, continue
			if (!this.canBuildOrDestroy(castle, craftsmen.side)) continue;

			// Get the distance from the craftsman to the castle
			const distance = craftsmen.distance(castle);
			// If the distance is 0, return null
			if (distance === 0) return null;

			// Update the min distance and closest castle
			if (distance < min) {
				min = distance;
				closestCastle = castle;
			}
		}

		// Return the closest castle (can be null)
		return closestCastle;
	}

	/**
	 * @description Get action to go to the position
	 * @param pos - Position to build or destroy
	 * @param side - Side of the player
	 * @returns Whether the craftsman can build or destroy at the position
	 */
	private canBuildOrDestroy(pos: Position, side: EWallSide): boolean {
		// Get the positions around the position
		const positions = pos.topRightBottomLeft();

		// Check whether the craftsman can build or destroy at the position
		return positions.some((pos) => {
			if (!pos.isValid(this.width, this.height)) return false;
			if (this.hashedCraftmens.exist(pos)) return false;
			if (this.hashedPonds.exist(pos)) return false;
			if (this.hashedCastles.exist(pos)) return false;
			if (this.hashedWalls.read(pos)?.side === side) return false;

			return true;
		});
	}

	/**
	 * @description Get action to go to the position
	 * @param craftsmen - Craftsmen position
	 * @returns Action to go to the position
	 */
	private getDestroyAction(craftsmen: CraftsmenPosition): ActionDto | null {
		// Get the destroy action from the position, if it does not exist, return null
		const positions = craftsmen.topRightBottomLeft();
		const actionParams: EBuildDestryParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			const param = actionParams[i];

			// If the craftsman can not destroy a wall at the position, continue
			if (!this.hashedWalls.exist(pos)) continue;
			// If the craftsman can not destroy a wall at the position, continue
			if (this.hashedWalls.read(pos)!.side === craftsmen.side) continue;

			// Mark the position as going to
			this.goingTo.write(pos, pos);

			// Return the destroy action
			return {
				craftsman_id: craftsmen.id,
				action: 'DESTROY',
				action_param: param,
			};
		}

		// If the craftsman can not destroy a wall at any position
		return null;
	}
}
