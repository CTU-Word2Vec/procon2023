import { EActionParam, EBuildDestryParam, buildDestroyActionParams } from '@/constants/action-params';
import Field from '@/models/Field';
import { ActionDto } from '@/services';
import generatePermutations from '@/utils/permutation';
import { CraftsmenPosition, HashedType, Position } from '.';
import { EWallSide } from '../enums';
import GameManager from './GameManager';
import PriorityQueue from './PriorityQueue';

/**
 * @description Dijktra game manager
 * @extends GameManager
 */
export default class DijktraGameManager extends GameManager {
	public override getNextActions(side: EWallSide): ActionDto[] {
		return this.solverDijkstra(side);
	}

	public override async getNextActionsAsync(side: EWallSide): Promise<ActionDto[]> {
		return this.getNextActions(side);
	}

	private ownMoveTo: Position[];
	private createMap: HashedType<boolean>;
	private breakMap: HashedType<boolean>;

	constructor(field: Field, numberOfTurns?: number) {
		super(field, numberOfTurns);
		this.ownMoveTo = Array.from({ length: this.craftsmen.length }, () => new Position(-1, -1));
		this.createMap = new HashedType<boolean>();
		this.breakMap = new HashedType<boolean>();

		// Init create map and break map
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				const pos = new Position(i, j);
				if (!this.hashedWalls.exist(pos) && !this.hashedCastles.exist(pos)) this.createMap.write(pos, true);
				if (this.hashedWalls.exist(pos)) this.breakMap.write(pos, true);
			}
		}
	}

	private solverDijkstra(side: EWallSide): ActionDto[] {
		const ownCrafts: CraftsmenPosition[] = this.craftsmen.filter((craftsmen) => craftsmen.side === side);
		const eneCrafts: CraftsmenPosition[] = this.craftsmen.filter((craftsmen) => craftsmen.side !== side);

		// Default max hands
		let maxHands: ActionDto[] = ownCrafts.map((craft) => craft.getStayAction());
		let maxToPositions: Position[] = ownCrafts.map(() => new Position(-1, -1));
		let maxHandsScore: number = -Infinity;

		const permutations: CraftsmenPosition[][] = generatePermutations<CraftsmenPosition>(ownCrafts);

		const start = new Date().getTime();

		for (const ownCraftsmens of permutations) {
			const ownPos = new HashedType<boolean>(ownCrafts, true);
			const enePos = new HashedType<boolean>(eneCrafts, true);
			const inCreateMap = this.createMap.clone();
			const inBreakMap = this.breakMap.clone();

			const footprints = new HashedType<boolean>(ownCrafts, true);

			const nowHands: ActionDto[] = [];
			const nowToPositions: Position[] = [];
			let nowHandsScore: number = 0;

			for (let i = 0; i < ownCraftsmens.length; i++) {
				const currentCraft = ownCraftsmens[i];
				const x = currentCraft.x;
				const y = currentCraft.y;

				let act = currentCraft.getStayAction();
				const dist = new HashedType<number>();
				let from = new Position(x, y);
				let to = new Position(x, y);

				if (!this.isValidPosition(this.ownMoveTo[i])) {
					const res = this.ownDijkstra(
						footprints,
						dist,
						ownPos,
						enePos,
						currentCraft,
						side,
						inCreateMap,
						inBreakMap,
					);

					if (res) {
						from = res.from;
						to = res.to;

						if (currentCraft.isEquals(from)) {
							// If the current position is the first position
							if (inBreakMap.exist(to))
								act = currentCraft.getDestroyAction(res.direction as EBuildDestryParam);
							if (inCreateMap.exist(to))
								act = currentCraft.getBuildAction(res.direction as EBuildDestryParam);
						} else {
							// If the current position is not the first position
							inBreakMap.remove(to);
							inCreateMap.remove(to);

							act = this.getActionToGoToPosition(currentCraft, to) || act;
						}
					}
				} else {
					act = this.getActionToGoToPosition(currentCraft, this.ownMoveTo[i]) || act;
					to = this.ownMoveTo[i];
				}

				nowHands.push(act);
				nowToPositions.push(to);

				if (act.action === 'STAY') {
					nowHandsScore -= 50;
				}
				if (act.action === 'MOVE') {
					ownPos.remove(currentCraft);
					ownPos.write(to, true);
					nowHandsScore -= dist.read(to)!;
				}
				if (act.action === 'BUILD') {
					this.createMap.remove(to);
					nowHandsScore += 100;
				}
				if (act.action === 'DESTROY') {
					inBreakMap.remove(to);
					if (this.breakMap.exist(to)) {
						nowHandsScore += 100;
					} else {
						nowHandsScore -= 100;
					}
				}

				if (nowHandsScore > maxHandsScore) {
					maxHands = nowHands;
					maxToPositions = nowToPositions;
					maxHandsScore = nowHandsScore;
				}
			}
		}

		const end = new Date().getTime();

		console.log('Dijstra: ' + (end - start) + 'ms');

		for (const i in maxHands) {
			const act = maxHands[i];
			const to = maxToPositions[i];

			if (act.action === 'BUILD') {
				this.createMap.remove(to);
			}

			if (act.action === 'DESTROY') {
				this.breakMap.remove(to);
			}
		}

		return maxHands;
	}

	private ownDijkstra(
		footprints: HashedType<boolean>,
		dist: HashedType<number>,
		ownPos: HashedType<boolean>,
		enePos: HashedType<boolean>,
		startPos: Position,
		ownSide: EWallSide,
		createMap: HashedType<boolean>,
		breakMap: HashedType<boolean>,
	): {
		from: Position;
		to: Position;
		direction?: EActionParam;
	} | null {
		const eneSide = ownSide === 'A' ? 'B' : 'A';

		dist.write(startPos, 0);

		const queue = new PriorityQueue<Position>();
		queue.enQueue(startPos, 0);

		while (!queue.isEmpty()) {
			const top = queue.deQueue();

			const from = top.value;
			const d = top.priority;

			if (dist.exist(from) && dist.read(from)! < d) continue; // Skip if the distance is greater than the current distance

			/**
			 * @description Top right bottom left of the position
			 */
			const trbl = from.topRightBottomLeft();

			for (const i in trbl) {
				const to = trbl[i];
				let cost = 1;
				let totalCost = 0;

				if (!this.isValidPosition(to)) continue; // Skip if the position is invalid
				if (createMap.exist(to)) {
					if (d !== 0 || !enePos.exist(to))
						// Skip if the position is not the first position and the position is enemy position
						return { from: startPos, to: to, direction: buildDestroyActionParams[i] };
				}
				if (breakMap.exist(to)) return { from: startPos, to: to, direction: buildDestroyActionParams[i] }; // If can break wall, return the position
				if (d === 0 && (enePos.exist(to) || ownPos.exist(to) || footprints.exist(to))) continue; // Skip if the position is enemy position or own position or footprints)))
				if (this.hashedPonds.exist(to)) continue; // Skip if the position is pond
				if (this.hashedWalls.exist(to) && this.hashedWalls.read(to)!.side === eneSide) cost = 1.875;

				totalCost = dist.read(from)! + cost;

				if (!dist.exist(to) || totalCost < dist.read(to)!) {
					dist.write(to, totalCost);
					queue.enQueue(to, totalCost);
				}
			}

			const ulurlllr = from.upperLeftUpperRightLowerRightLowerLeft();

			for (const i in ulurlllr) {
				const to = ulurlllr[i];
				const cost = 1;
				let totalCost = 0;

				if (!this.isValidPosition(to)) continue; // Skip if the position is invalid
				if (this.hashedWalls.exist(to) && this.hashedWalls.read(to)!.side === eneSide) continue; // Skip if the position is enemy wall
				if (this.hashedPonds.exist(to)) continue; // Skip if the position is pond

				totalCost = dist.read(from)! + cost;

				if (!dist.exist(to) || totalCost < dist.read(to)!) {
					dist.write(to, totalCost);
					queue.enQueue(to, totalCost);
				}
			}
		}

		return null;
	}
}
