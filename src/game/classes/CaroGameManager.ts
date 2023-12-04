import { buildDestroyActionParams } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { EWallSide } from '../enums/EWallSide';
import ICaroGameManager from '../interfaces/ICaroGameManager';
import CraftsmenPosition from './CraftsmenPosition';
import GameManager from './GameManager';
import HashedCounter from './HashedCounter';
import HashedType from './HashedType';
import Position from './Position';
import PriorityQueue from './PriorityQueue';

const BUILD_TEMPLATE = [
	[false, false, true, false, false],
	[false, true, false, true, false],
	[true, false, false, false, true],
	[false, true, false, true, false],
	[false, false, true, false, false],
];

// const BUILD_TEMPLATE = [
// 	[false, true, false],
// 	[true, false, true],
// 	[false, true, false],
// ];

const TEMPLATE_WIDTH = BUILD_TEMPLATE[0].length;
const TEMPLATE_HEIGHT = BUILD_TEMPLATE.length;

const HASHED_BUILD_TEMPLATE = new HashedType<boolean>();
for (const x in BUILD_TEMPLATE) {
	for (const y in BUILD_TEMPLATE[x]) {
		if (!BUILD_TEMPLATE[x][y]) continue;
		HASHED_BUILD_TEMPLATE.write(new Position(+x, +y), true);
	}
}

/**
 * @description Caro game manager
 * @extends GameManager
 * @implements ICaroGameManager
 */
export default class CaroGameManager extends GameManager implements ICaroGameManager {
	private hashedBuildPositions: HashedType<boolean> = new HashedType<boolean>();
	private hashedDestroyPositions: HashedType<boolean> = new HashedType<boolean>();
	private scoreCounter: HashedCounter = new HashedCounter();

	private prepareCreatePositions(side: EWallSide = 'A') {
		this.targetPositions = [];
		this.hashedBuildPositions = new HashedType<boolean>();
		this.hashedDestroyPositions = new HashedType<boolean>();
		this.scoreCounter = new HashedCounter();

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const pos = new Position(x, y);
				{
					// Nếu có thể xây, thì xây
					if (this.checkCreate(pos, side)) this.hashedBuildPositions.write(pos, true);
				}
				{
					// Check destroy scoped
					if (this.checkDestroy(pos, side)) this.hashedDestroyPositions.write(pos, true);
				}
			}
		}

		for (const castle of this.castles) {
			for (const pos of castle.topRightBottomLeft()) {
				if (this.hashedWalls.exist(pos)) continue;
				if (this.hashedCastles.exist(pos)) continue;
				if (this.hashedPonds.exist(pos)) continue;
				if (this.hashedCraftmens.exist(pos)) continue;

				this.hashedBuildPositions.write(pos, true);
			}
		}

		for (const pond of this.ponds) {
			for (const pos of pond.topRightBottomLeft()) {
				if (this.hashedWalls.exist(pos)) continue;
				if (this.hashedCastles.exist(pos)) continue;
				if (this.hashedPonds.exist(pos)) continue;
				if (this.hashedCraftmens.exist(pos)) continue;

				this.hashedBuildPositions.write(pos, true);
			}
		}

		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const pos = new Position(x, y);

				if (this.hashedBuildPositions.exist(pos)) continue;
				if (this.hashedWalls.exist(pos)) continue;
				if (this.hashedPonds.exist(pos)) continue;
				if (this.hashedSide.exist(pos) && this.hashedSide.read(pos) === side) continue;

				const trbl = pos.topRightBottomLeft();
				let builds = 0;

				for (const p of trbl) {
					if (this.hashedBuildPositions.exist(p)) builds++;
					if (this.hashedWalls.exist(p) && this.hashedWalls.read(p)!.side !== side)
						this.scoreCounter.increase(pos, 0.25);
					if (this.hashedCraftmens.exist(pos) && this.hashedCraftmens.read(pos)!.side !== side)
						this.scoreCounter.decrease(pos, 0.25);
				}

				switch (builds) {
					case 1:
						this.scoreCounter.write(new Position(x, y), 1.5);
						break;
					case 2:
						this.scoreCounter.write(new Position(x, y), 1.25);
						break;
					case 3:
						this.scoreCounter.write(new Position(x, y), 1);
						break;
					case 0:
						break;
					default:
						this.scoreCounter.write(new Position(x, y), 0.5);
				}

				if (this.hashedCastles.exist(pos)) this.scoreCounter.increase(pos, 1);
			}
		}

		this.buildPositions = this.hashedBuildPositions.toList();
		this.destroyPositions = this.hashedDestroyPositions.toList();
		this.scorePositions = this.scoreCounter.toList();
	}

	private checkCreate(pos: Position, ownSide: EWallSide): boolean {
		const needCondition =
			HASHED_BUILD_TEMPLATE.exist(new Position(pos.x % (TEMPLATE_WIDTH - 1), pos.y % (TEMPLATE_HEIGHT - 1))) ||
			pos.x == this.width - 1 ||
			pos.y == this.height - 1;

		if (!needCondition) return false;

		if (
			pos
				.topRightBottomLeft()
				.some((pos) => this.hashedCraftmens.exist(pos) && this.hashedCraftmens.read(pos)!.side !== ownSide)
		)
			return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.isInSide(pos, ownSide)) return false;

		return true;
	}

	private checkDestroy(pos: Position, ownSide: EWallSide): boolean {
		if (!this.hashedWalls.exist(pos)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (
			pos
				.topRightBottomLeft()
				.some((pos) => this.hashedCraftmens.exist(pos) && this.hashedCraftmens.read(pos)!.side !== ownSide)
		)
			return false;
		if (this.hashedWalls.read(pos)!.side !== ownSide) return true;

		return false;
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

		this.targetPositions.push(pos);

		// If the craftsman can not do anything, stay
		return nextAction;
	}

	/**
	 * @description Get next position for the craftsman
	 * @param craftmen - Craftsmen position
	 * @returns Next position for the craftsman
	 */
	private getNextPosition(craftmen: CraftsmenPosition): Position | null {
		// const closestCastle = this.findClosestCastle(craftmen);
		// if (closestCastle) {
		// 	for (const pos of closestCastle.topRightBottomLeft()) {
		// 		this.hashedBuildPositions.remove(pos);
		// 	}

		// 	return closestCastle;
		// }

		// Initialize positions array, use this like a queue
		const queue = new PriorityQueue<Position>();
		const visited = new HashedType<boolean>();

		queue.enQueue(craftmen, 0);

		let bestScore = Infinity;
		let bestPos: Position | null = null;

		while (!queue.isEmpty()) {
			// Get the first position in the positions array and remove it from the array
			const top = queue.deQueue();
			const pos = top.value;

			if (visited.exist(pos)) continue;
			visited.write(pos, true);

			// If the position is not valid, continue
			if (!pos.isValid(this.width, this.height)) continue;
			// if (pos.distance(craftmen) > 15 && bestPos) break;
			if (this.hashedPonds.exist(pos)) continue;
			// if (this.hashedWalls.exist(pos) && this.hashedWalls.read(pos)!.side !== craftmen.side) continue;

			const trbl = pos.topRightBottomLeft();

			for (const near of trbl) {
				// Nếu xung quanh có con nào là con của mình thì bỏ qua
				const haveOwnCraftmen = near
					.topRightBottomLeft()
					.some((p) => this.hashedCraftmens.exist(p) && this.hashedCraftmens.read(p)!.side === craftmen.side);
				if (haveOwnCraftmen) continue;

				if (this.hashedBuildPositions.exist(near)) {
					if (top.priority < bestScore) {
						bestScore = top.priority;
						bestPos = pos;
					}
				}

				if (this.hashedDestroyPositions.exist(near)) {
					if (top.priority < bestScore) {
						bestScore = top.priority;
						bestPos = pos;
					}
				}
			}

			const allNears = pos.allNears();

			for (const near of allNears) {
				queue.enQueue(near, craftmen.distance(near) - this.scoreCounter.read(near));
			}
		}

		console.log('Cannot find next position for the craftsman', craftmen);

		// Khúc này xóa mark để mấy con khác không đi vào
		for (const pos of bestPos?.topRightBottomLeft() ?? []) {
			this.hashedBuildPositions.remove(pos);
			this.hashedDestroyPositions.remove(pos);
		}

		// If the craftsman can not go to any position, return null
		return bestPos;
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

			if (!this.hashedBuildPositions.exist(pos)) continue;

			this.hashedBuildPositions.remove(pos);
			return craftmen.getBuildAction(buildDestroyActionParams[i]);
		}

		return null;
	}

	// /**
	//  * @description Find the closest castle from the craftsman
	//  * @param craftsmen - Craftsmen position
	//  * @returns Closest castle
	//  */
	// private findClosestCastle(craftsmen: CraftsmenPosition): Position | null {
	// 	// Initialize min distance and closest castle
	// 	let min = Infinity;
	// 	let closestCastle: Position | null = null;

	// 	for (const castle of this.castles) {
	// 		if (!castle.topRightBottomLeft().some((pos) => this.hashedBuildPositions.exist(pos))) continue;

	// 		const distance = craftsmen.distance(castle);
	// 		// If the distance is 0, return null
	// 		if (distance === 0) return null;

	// 		// Update the min distance and closest castle
	// 		if (distance < min) {
	// 			min = distance;
	// 			closestCastle = castle;
	// 		}
	// 	}

	// 	// Return the closest castle (can be null)
	// 	return closestCastle;
	// }

	/**
	 * @description Get action to go to the position
	 * @param craftsmen - Craftsmen position
	 * @returns Action to go to the position
	 */
	private getDestroyAction(craftsmen: CraftsmenPosition): ActionDto | null {
		// Get the destroy action from the position, if it does not exist, return null
		const positions = craftsmen.topRightBottomLeft();

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			const param = buildDestroyActionParams[i];

			if (!this.hashedDestroyPositions.exist(pos)) continue;

			this.hashedDestroyPositions.remove(pos);
			// Return the destroy action
			return craftsmen.getDestroyAction(param);
		}

		// If the craftsman can not destroy a wall at any position
		return null;
	}
}
