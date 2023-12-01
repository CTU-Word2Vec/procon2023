import {
	EActionParam,
	EBuildDestroyParam,
	buildDestroyActionParams,
	moveParams,
	reverseBuildDestroyActionParams,
	reverseMoveParams,
} from '@/constants/action-params';
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
		this.ownMoveTo = this.craftsmen.map(() => new Position(-1, -1));
		this.createMap = new HashedType<boolean>();
		this.breakMap = new HashedType<boolean>();

		this.prepareCreateAndBreakMap();
	}

	private prepareCreateAndBreakMap(ownSide: EWallSide = 'A') {
		this.createMap = new HashedType<boolean>();
		this.breakMap = new HashedType<boolean>();

		// Init create map and break map
		for (let i = 0; i < this.width; i++) {
			for (let j = 0; j < this.height; j++) {
				const pos = new Position(i, j);
				if (
					!this.hashedWalls.exist(pos) && // Nếu không có tường
					!this.hashedCastles.exist(pos) && // Nếu không có lâu đài
					!this.hashedCraftmens.exist(pos) && // Nếu không có thợ xây
					!this.isInSide(pos, ownSide) // Nếu không có trong lãnh thổ của mình
				)
					this.createMap.write(pos, true);
				if (
					this.hashedWalls.exist(pos) && // Phải có tường mới có thể phá
					((this.isInSide(pos, ownSide) && this.territory_coeff / 1.5 > this.wall_coeff) || // Nếu là tường của mình mà điểm cho lãnh thổ thấp quá thì cho cút
						this.hashedWalls.read(pos)!.side !== ownSide) // Nếu là tường của đối phương thì phá luôn
				)
					this.breakMap.write(pos, true);
			}
		}
	}

	private solverDijkstra(ownSide: EWallSide): ActionDto[] {
		this.prepareCreateAndBreakMap(ownSide);

		const eneSide: EWallSide = ownSide === 'A' ? 'B' : 'A';

		const ownCrafts: CraftsmenPosition[] = this.craftsmen.filter((craftsmen) => craftsmen.side === ownSide);
		const eneCrafts: CraftsmenPosition[] = this.craftsmen.filter((craftsmen) => craftsmen.side !== ownSide);

		// Default max hands
		let maxHands: ActionDto[] = ownCrafts.map((craft) => craft.getStayAction());
		let maxFromPositions: Position[] = ownCrafts.map(() => new Position(-1, -1));
		let maxToPositions: Position[] = ownCrafts.map(() => new Position(-1, -1));
		let maxHandsScore: number = -Infinity;

		const permutations: CraftsmenPosition[][] = generatePermutations<CraftsmenPosition>(ownCrafts);

		const start = new Date().getTime();

		for (const ownCraftsmens of permutations) {
			const ownPos: HashedType<boolean> = new HashedType<boolean>(ownCrafts, true);
			const enePos: HashedType<boolean> = new HashedType<boolean>(eneCrafts, true);
			const inCreateMap: HashedType<boolean> = this.createMap.clone();
			const inBreakMap: HashedType<boolean> = this.breakMap.clone();

			const footprints: HashedType<boolean> = new HashedType<boolean>(ownCrafts, true);

			const nowHands: ActionDto[] = [];
			const nowToPositions: Position[] = [];
			const nowFromPositions: Position[] = [];
			let nowHandsScore: number = 0;

			for (let i = 0; i < ownCraftsmens.length; i++) {
				const currentCraft: CraftsmenPosition = ownCraftsmens[i];
				const x: number = currentCraft.x;
				const y: number = currentCraft.y;

				let dist: HashedType<number> = new HashedType<number>();
				let act: ActionDto = currentCraft.getStayAction();
				let from: Position = new Position(x, y);
				let to: Position = new Position(x, y);

				if (!this.isValidPosition(this.ownMoveTo[i])) {
					const res = this.ownDijkstra(
						footprints,
						dist,
						ownPos,
						enePos,
						currentCraft,
						ownSide,
						inCreateMap,
						inBreakMap,
					);

					if (res) {
						from = res.from;
						to = res.to;

						if (currentCraft.isEquals(from)) {
							// If the current position is the first position
							if (inBreakMap.exist(to))
								act = currentCraft.getDestroyAction(res.direction as EBuildDestroyParam);
							if (inCreateMap.exist(to))
								act = currentCraft.getBuildAction(res.direction as EBuildDestroyParam);
						} else {
							// If the current position is not the first position
							inBreakMap.remove(to);
							inCreateMap.remove(to);
							let d: number = dist.read(from)!;

							for (;;) {
								let getProcessFlag = false;
								let getAnswerFlag = false;

								if (this.hashedWalls.read(from)?.side != eneSide) {
									const ulurlllr: Position[] = from.upperLeftUpperRightLowerLeftLowerRight();

									for (const i in ulurlllr) {
										const nextPos: Position = ulurlllr[i];

										if (!this.isValidPosition(nextPos)) continue;

										if (nextPos.isEquals(currentCraft) && d == 1) {
											getAnswerFlag = true;
											to = from;
											act = currentCraft.getMoveAction(reverseMoveParams[moveParams[+i + 4]]);
										}

										if (dist.read(nextPos) === d - 1) {
											from = nextPos;
											getProcessFlag = true;
											d -= 1;
											break;
										}
									}
								}

								if (getProcessFlag) continue;
								if (getAnswerFlag) break;

								const trbl: Position[] = from.topRightBottomLeft();

								for (const i in trbl) {
									const nextPos: Position = trbl[i];

									if (!this.isValidPosition(nextPos)) continue;
									if (currentCraft.isEquals(nextPos)) {
										getAnswerFlag = true;
										to = nextPos;

										if (
											this.hashedWalls.exist(from) &&
											this.hashedWalls.read(from)!.side === eneSide
										)
											act = currentCraft.getDestroyAction(
												reverseBuildDestroyActionParams[buildDestroyActionParams[i]],
											);
										else act = currentCraft.getMoveAction(reverseMoveParams[moveParams[i]]);

										break;
									}

									if (this.hashedWalls.exist(from) && this.hashedWalls.read(from)!.side === eneSide) {
										if (dist.read(nextPos) === d - 1.875) {
											from = nextPos;
											getProcessFlag = true;
											d -= 1.875;
											break;
										}
									} else if (dist.read(nextPos) === d - 1) {
										from = nextPos;
										getProcessFlag = true;
										d -= 1;
										break;
									}
								}

								if (getAnswerFlag) break;
								if (!getProcessFlag) break; // If the process is not found, throw an error
							}
						}
					}
				} else {
					const targetPos = this.ownMoveTo[i];
					dist = new HashedType<number>();
					this.moveDijkstra(footprints, dist, ownPos, enePos, currentCraft, targetPos, ownSide);

					from = targetPos;
					let d: number = dist.read(targetPos)!;

					if (d != -1) {
						for (;;) {
							let getProcessFlag = false;
							let getAnswerFlag = false;

							if (this.hashedWalls.read(from)?.side != eneSide) {
								const ulurlllr: Position[] = from.upperLeftUpperRightLowerLeftLowerRight();

								for (const i in ulurlllr) {
									const nextPos: Position = ulurlllr[i];

									if (!this.isValidPosition(nextPos)) continue;

									if (nextPos.isEquals(currentCraft) && d == 1) {
										getAnswerFlag = true;
										to = nextPos;
										act = currentCraft.getMoveAction(reverseMoveParams[moveParams[+i + 4]]);
									}

									if (dist.read(nextPos) === d - 1) {
										from = nextPos;
										getProcessFlag = true;
										d -= 1;
										break;
									}
								}
							}

							if (getProcessFlag) continue;
							if (getAnswerFlag) break;

							const trbl: Position[] = from.topRightBottomLeft();

							for (const i in trbl) {
								const nextPos: Position = trbl[i];

								if (!this.isValidPosition(nextPos)) continue;
								if (currentCraft.isEquals(nextPos)) {
									getAnswerFlag = true;
									to = nextPos;

									if (this.hashedWalls.exist(from) && this.hashedWalls.read(from)!.side === eneSide)
										act = currentCraft.getDestroyAction(
											reverseBuildDestroyActionParams[buildDestroyActionParams[i]],
										);
									else act = currentCraft.getMoveAction(reverseMoveParams[moveParams[i]]);

									break;
								}

								if (this.hashedWalls.exist(from) && this.hashedWalls.read(from)!.side === eneSide) {
									if (dist.read(nextPos) === d - 1.875) {
										from = nextPos;
										getProcessFlag = true;
										d -= 1.875;
										break;
									}
								} else if (dist.read(nextPos) === d - 1) {
									from = nextPos;
									getProcessFlag = true;
									d -= 1;
									break;
								}
							}

							if (getAnswerFlag) break;
							if (!getProcessFlag) break; // If the process is not found, throw an error
						}
					}
				}

				nowHands.push(act);
				nowFromPositions.push(from);
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
						nowHandsScore -= dist.read(from)!;
					} else {
						nowHandsScore += 100;
					}
				}
			}

			if (nowHandsScore > maxHandsScore) {
				maxHands = nowHands;
				maxFromPositions = nowFromPositions;
				maxToPositions = nowToPositions;
				maxHandsScore = nowHandsScore;
			}
		}

		const end: number = new Date().getTime();

		console.log('Dijstra: ' + (end - start) + 'ms');

		for (const i in maxHands) {
			const act: ActionDto = maxHands[i];
			const from: Position = maxFromPositions[i];
			const to: Position = maxToPositions[i];

			if (act.action === 'MOVE' && this.ownMoveTo[i].isEquals(from)) {
				this.ownMoveTo[i] = new Position(-1, -1); // If the position is the first position, reset the position
			}

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
						return { from, to: to, direction: buildDestroyActionParams[i] };
				}
				if (breakMap.exist(to)) return { from, to: to, direction: buildDestroyActionParams[i] }; // If can break wall, return the position
				if (d === 0 && (enePos.exist(to) || ownPos.exist(to) || footprints.exist(to))) continue; // Skip if the position is enemy position or own position or footprints)))
				if (this.hashedPonds.exist(to)) continue; // Skip if the position is pond
				if (this.hashedWalls.exist(to) && this.hashedWalls.read(to)!.side === eneSide) cost = 1.875;

				totalCost = dist.read(from)! + cost;

				if (!dist.exist(to) || totalCost < dist.read(to)!) {
					dist.write(to, totalCost);
					queue.enQueue(to, totalCost);
				}
			}

			const ulurlllr = from.upperLeftUpperRightLowerLeftLowerRight();

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

	private moveDijkstra(
		footprints: HashedType<boolean>,
		dist: HashedType<number>,
		ownPos: HashedType<boolean>,
		enePos: HashedType<boolean>,
		startPos: Position,
		targetPos: Position,
		ownSide: EWallSide,
	) {
		const eneSide = ownSide === 'A' ? 'B' : 'A';

		dist.write(startPos, 0);

		const queue = new PriorityQueue<Position>();
		queue.enQueue(startPos, 0);

		while (!queue.isEmpty()) {
			const top = queue.deQueue();

			if (top.value.isEquals(targetPos)) return;

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
				if (d === 0 && (enePos.exist(to) || ownPos.exist(to) || footprints.exist(to))) continue; // Skip if the position is enemy position or own position or footprints)))
				if (this.hashedPonds.exist(to)) continue; // Skip if the position is pond
				if (this.hashedWalls.exist(to) && this.hashedWalls.read(to)!.side === eneSide) cost = 1.875;

				totalCost = dist.read(from)! + cost;

				if (!dist.exist(to) || totalCost < dist.read(to)!) {
					dist.write(to, totalCost);
					queue.enQueue(to, totalCost);
				}
			}

			const ulurlllr = from.upperLeftUpperRightLowerLeftLowerRight();

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
	}
}
