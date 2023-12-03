import { buildDestroyActionParams } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { HashedType } from '.';
import { EWallSide } from '../enums/EWallSide';
import ICaroGameManager from '../interfaces/ICaroGameManager';
import CraftsmenPosition from './CraftsmenPosition';
import GameManager from './GameManager';
import Position from './Position';
import PriorityQueue from './PriorityQueue';

/**
 * @description Caro game manager
 * @extends GameManager
 * @implements ICaroGameManager
 */
export default class CaroGameManager extends GameManager implements ICaroGameManager {
	private createPositions: HashedType<boolean> = new HashedType<boolean>();
	private destroyPositions: HashedType<boolean> = new HashedType<boolean>();

	private prepareCreatePositions(side: EWallSide = 'A') {
		this.createPositions = new HashedType<boolean>();
		this.destroyPositions = new HashedType<boolean>();

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const pos = new Position(x, y);
				{
					// Check create scoped
					if (this.checkCreate(pos, side)) this.createPositions.write(pos, true);
				}
				{
					// Check destroy scoped
					if (this.checkDestroy(pos, side)) this.destroyPositions.write(pos, true);
				}
			}
		}
	}

	private checkCreate(pos: Position, ownSide: EWallSide): boolean {
		const needCondition = (pos.x + pos.y) % 2 === 0;

		if (!needCondition) return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.isInSide(pos, ownSide)) return false;

		return true;
	}

	private checkDestroy(pos: Position, ownSide: EWallSide): boolean {
		if (!this.hashedWalls.exist(pos)) return false;
		if (this.hashedWalls.read(pos)!.side !== ownSide) return true;
		if (!this.isInSide(pos, ownSide)) return false;

		return this.territory_coeff / this.wall_coeff > 3;
	}

	public getNextActions(side: EWallSide): ActionDto[] {
		this.prepareCreatePositions(side);

		return super.getNextActions(side);
	}

	public getNextActionsAsync(side: EWallSide): Promise<ActionDto[]> {
		this.prepareCreatePositions(side);
		return super.getNextActionsAsync(side);
	}

	protected override getNextCraftsmenAction(craftmen: CraftsmenPosition): ActionDto {
		// If the craftsman can build a wall, build it
		const buildAction = this.getCraftsmenBuildAction(craftmen);
		if (buildAction) return buildAction;

		// If the craftsman can destroy a wall, destroy it
		const destroyAction = this.getDestroyAction(craftmen);
		if (destroyAction) return destroyAction;

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
	 * @description Get next position for the craftsman
	 * @param craftmen - Craftsmen position
	 * @returns Next position for the craftsman
	 */
	private getNextPosition(craftmen: CraftsmenPosition): Position | null {
		const closestCastle = this.findClosestCastle(craftmen);
		if (closestCastle) return closestCastle;

		// Initialize positions array, use this like a queue
		const position = new Position(craftmen.x, craftmen.y);
		const queue = new PriorityQueue<Position>();
		const visited = new HashedType<boolean>();

		queue.enQueue(position, 0);

		while (!queue.isEmpty()) {
			// Get the first position in the positions array and remove it from the array
			const top = queue.deQueue();
			const pos = top.value;

			if (visited.exist(pos)) continue;
			visited.write(pos, true);

			// If the position is not valid, continue
			if (!pos.isValid(this.width, this.height)) continue;
			if (this.hashedPonds.exist(pos)) continue;
			if (this.hashedWalls.exist(pos) && this.hashedWalls.read(pos)!.side === craftmen.side) continue;

			const trbl = pos.topRightBottomLeft();

			if (trbl.some((p) => this.createPositions.exist(p) || this.destroyPositions.exist(p))) return pos;

			const allNears = pos.allNears();

			for (const near of allNears) {
				queue.enQueue(near, top.priority + 1);
			}
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
	private getCraftsmenBuildAction(craftmen: CraftsmenPosition): ActionDto | null {
		const trbl = craftmen.topRightBottomLeft();

		for (const i in trbl) {
			const pos = trbl[i];

			if (!this.createPositions.exist(pos)) continue;

			this.createPositions.remove(pos);
			return craftmen.getBuildAction(buildDestroyActionParams[i]);
		}

		return null;
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

			this.destroyPositions.remove(pos);
			// Return the destroy action
			return craftsmen.getDestroyAction(param);
		}

		// If the craftsman can not destroy a wall at any position
		return null;
	}
}
