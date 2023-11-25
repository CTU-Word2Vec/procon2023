import { EBuildDestryParam, buildDestroyActionParams } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { HashedType } from '.';
import { EWallSide } from '../enums/EWallSide';
import ICaroGameManager from '../interfaces/ICaroGameManager';
import CraftsmenPosition from './CraftsmenPosition';
import GameManager from './GameManager';
import Position from './Position';

/**
 * @description Caro game manager
 * @extends GameManager
 * @implements ICaroGameManager
 */
export default class CaroGameManager extends GameManager implements ICaroGameManager {
	protected override getNextCraftsmenAction(craftmen: CraftsmenPosition): ActionDto {
		// If the craftsman can build a wall, build it
		const buildAction = this.getBuildAction(craftmen);
		if (buildAction) return buildAction;

		// If the craftsman can destroy a wall, destroy it
		const destroyAction = this.getDestroyAction(craftmen);
		if (destroyAction) return destroyAction;

		// If the craftsman can go to the closest castle, go to it
		const gotoClosestCastleAction = this.gotoClosestCastleAction(craftmen);
		if (gotoClosestCastleAction) return gotoClosestCastleAction;

		// Get next position for the craftsman
		const pos = this.getNextPosition(craftmen);
		if (!pos) return craftmen.getStayAction();

		// If the craftsman can go to the position, go to it
		const nextAction = this.getActionToGoToPosition(craftmen, pos);
		if (!nextAction) return craftmen.getStayAction();

		this.goingTo.write(pos, pos);

		// If the craftsman can not do anything, stay
		return nextAction;
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
		const visited = new HashedType<boolean>();

		while (positions.length) {
			// Get the first position in the positions array and remove it from the array
			const pos = positions.shift() as Position;

			if (visited.exist(pos)) continue;
			visited.write(pos, true);

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
	 * @description Get craftsmen self-destroy action
	 * @param craftsmen - Craftsmen
	 * @returns Destroy action (can be null)
	 */
	private getSeflDestroyAction(craftsmen: CraftsmenPosition): ActionDto | null {
		// Get all nears of the position
		const nears = craftsmen.topRightBottomLeft();

		for (const index in nears) {
			const near = nears[index];
			const actionParam = buildDestroyActionParams[index];

			// If the craftsman can not destroy a wall at the position, continue
			if (!this.willSelfDestroy(near, craftsmen.side)) continue;

			this.goingTo.write(craftsmen, craftsmen);

			return craftsmen.getDestroyAction(actionParam);
		}

		return null;
	}

	/**
	 * @description Check if can destroy
	 * @param pos - Position to destroy
	 * @param side - Side of current team
	 * @returns - Destroy action (can be null)
	 */
	private willSelfDestroy(pos: Position, side: EWallSide) {
		if (!this.hashedWalls.exist(pos)) return false;

		const [top, right, bottom, left] = pos.topRightBottomLeft();

		const willDestroyGroups = [[top, bottom, left, right]];

		for (const group of willDestroyGroups) {
			const valid = group.every(
				(pos) => this.hashedSide.read(pos) === side || this.hashedWalls.read(pos)?.side === side,
			);

			if (valid) return true;
		}

		return false;
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

		this.goingTo.write(craftmen, craftmen);

		return craftmen.getBuildAction(actionParam);
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

		for (let i = 0; i < positions.length; i++) {
			const position = positions[i];
			const param = buildDestroyActionParams[i];

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
		if (this.goingTo.exist(pos)) return false;
		// If the position is not valid, return false
		if (!this.canCraftsmenBuildWall(pos)) return false;

		// If position is at the end of the map, return true
		if (pos.x === 0 || pos.y === 0) return true;
		if (pos.x === this.width - 1 || pos.y === this.height - 1) return true;

		if (this.hashedSide.read(pos) === side) return false;

		// Get the positions around the position
		const [top, right, bottom, left, upperLeft, upperRight, lowerRight, lowerLeft] = pos.allNears();

		// If near castle, build
		const topRightBottomLeft = [top, right, bottom, left];
		for (const near of topRightBottomLeft) {
			if (this.hashedCastles.exist(near)) return true;
		}

		// If the craftsman can not build a wall at the position, return false
		const noBuildPairs = [
			[top, right, bottom, left],
			[right, upperRight, lowerRight],
			[bottom, lowerRight, lowerLeft],
			[left, upperLeft, lowerLeft],
			[top, upperLeft, upperRight],
			[top, left, upperLeft],
			[top, right, upperRight],
			[bottom, left, lowerLeft],
			[bottom, right, lowerRight],
		];

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
			if (this.hashedCraftmens.exist(castle) && !craftsmen.isEquals(castle)) continue;
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
		if (this.goingTo.exist(pos)) return false;

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
		// If have self destroy action, return it
		const selfDestroyAction = this.getSeflDestroyAction(craftsmen);
		if (selfDestroyAction) return selfDestroyAction;

		// Get the destroy action from the position, if it does not exist, return null
		const positions = craftsmen.topRightBottomLeft();

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			const param = buildDestroyActionParams[i];

			// If the craftsman can not destroy a wall at the position, continue
			if (!this.hashedWalls.exist(pos)) continue;
			// If the craftsman can not destroy a wall at the position, continue
			if (this.hashedWalls.read(pos)!.side === craftsmen.side) continue;

			// Mark the position as going to
			this.goingTo.write(pos, pos);

			// Return the destroy action
			return craftsmen.getDestroyAction(param);
		}

		// If the craftsman can not destroy a wall at any position
		return null;
	}
}
