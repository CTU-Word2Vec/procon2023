import { buildDestroyActionParams } from '@/constants/action-params';
import Field from '@/models/Field';
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

const BUILD_TEMPLATE_15x15 = [
	[false, true, false],
	[true, false, true],
	[false, true, false],
];

/**
 * @description Caro game manager
 * @extends GameManager
 * @implements ICaroGameManager
 */
export default class CaroGameManager extends GameManager implements ICaroGameManager {
	private hashedBuildPositions: HashedType<boolean> = new HashedType<boolean>();
	private hashedDestroyPositions: HashedType<boolean> = new HashedType<boolean>();
	private scoreCounter: HashedCounter = new HashedCounter();
	private HASHED_BUILD_TEMPLATE: HashedType<boolean>;
	private TEMPLATE_WIDTH: number;
	private TEMPLATE_HEIGHT: number;

	constructor(field: Field, numberOfTurns?: number) {
		super(field, numberOfTurns);

		this.HASHED_BUILD_TEMPLATE = new HashedType<boolean>();

		const _BUILD_TEMPLATE = this.width >= 16 ? BUILD_TEMPLATE : BUILD_TEMPLATE_15x15;

		for (const x in BUILD_TEMPLATE) {
			for (const y in _BUILD_TEMPLATE[x]) {
				if (!_BUILD_TEMPLATE[x][y]) continue;
				this.HASHED_BUILD_TEMPLATE.write(new Position(+x, +y), true);
			}
		}

		this.TEMPLATE_WIDTH = _BUILD_TEMPLATE[0].length;
		this.TEMPLATE_HEIGHT = _BUILD_TEMPLATE.length;
	}

	public override getNextActions(side: EWallSide): ActionDto[] {
		this.prepareGetNextActions(side);
		return super.getNextActions(side);
	}

	public override getNextActionsAsync(side: EWallSide): Promise<ActionDto[]> {
		this.prepareGetNextActions(side);
		return super.getNextActionsAsync(side);
	}

	/**
	 * @description Hàm này khởi tạo các giá trị sau: vị trí xây, vị trí phá, điểm của các vị trí và các vị trí đang cần đến
	 * @param side - Team mình
	 */
	private prepareGetNextActions(side: EWallSide = 'A') {
		this.targetPositions = [];
		this.hashedBuildPositions = new HashedType<boolean>();
		this.hashedDestroyPositions = new HashedType<boolean>();
		this.scoreCounter = new HashedCounter();

		// Đoạn này khởi tạo các vị trí xây và phá với điều kiện cơ bản
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const pos = new Position(x, y);
				// Nếu có thể xây, thì xây
				if (this.checkCreate(pos, side)) this.hashedBuildPositions.write(pos, true);
				// Check destroy scoped
				if (this.checkDestroy(pos, side)) this.hashedDestroyPositions.write(pos, true);
			}
		}

		// Đoạn này khởi tạo các vị trí xây và phá với điều kiện đặc biệt
		// Nếu có lâu đài thì xây xung quanh lâu đài với điều kiện lâu đài không được bao vây và không có đối phương ở gần đó
		for (const castle of this.castles) {
			for (const pos of castle.topRightBottomLeft()) {
				if (this.checkNotCreate(pos, side)) continue;
				this.hashedBuildPositions.write(pos, true);
			}
		}

		// Nếu có ao thì xây xung quanh ao với điều kiện ao không được bao vây và không có đối phương ở gần đó
		for (const pond of this.ponds) {
			for (const pos of pond.topRightBottomLeft()) {
				if (this.checkNotCreate(pos, side)) continue;
				this.hashedBuildPositions.write(pos, true);
			}
		}

		// Khúc này gán trọng số cho các vị trí có thể đi qua để xây
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				const pos = new Position(x, y);

				if (this.hashedBuildPositions.exist(pos)) continue; // Nếu vị trí này có thể xây thì bỏ qua
				if (this.hashedWalls.exist(pos)) continue; // Nếu vị trí này có tường thì bỏ qua
				if (this.hashedPonds.exist(pos)) continue; // Nếu vị trí này có ao thì bỏ qua
				if (this.hashedSide.exist(pos) && this.hashedSide.read(pos) === side) continue; // Nếu vị trí này có bên mình thì bỏ qua

				if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
					this.scoreCounter.decrease(pos, 0.1);
				} // Nếu ở gần biên thì giảm điểm

				const trbl = pos.topRightBottomLeft(); // Lấy các vị trí xung quanh
				let builds = 0; // Đếm số lượng vị trí có thể xây xung quanh

				for (const p of trbl) {
					if (this.hashedBuildPositions.exist(p)) builds++; // Nếu vị trí xung quanh có thể xây thì tăng biến đếm

					if (this.hashedWalls.exist(p) && this.hashedWalls.read(p)!.side !== side)
						// Nếu vị trí xung quanh có tường của đối phương thì tăng điểm
						this.scoreCounter.increase(pos, 0.25);

					if (this.hashedCraftmens.exist(pos) && this.hashedCraftmens.read(pos)!.side !== side)
						//  Nếu vị trí xung quanh có thợ thì giảm điểm
						this.scoreCounter.decrease(pos, 0.25);
				}

				// * Cái này chỉ mang tính tương đối
				switch (builds) {
					case 1: // Nếu có 1 vị trí xây xung quanh thì xem như là sẽ tạo thành một vùng khép kín (+1.5 điểm)
						this.scoreCounter.increase(new Position(x, y), 1.5);
						break;
					case 2: // Nếu có 2 vị trí xây xung quanh thì xem như đã có tường ở khu vực đó (+1.25 điểm)
						this.scoreCounter.increase(new Position(x, y), 1.25);
						break;
					case 3: // Nếu có 3 vị trí xây xung quanh thì có nghĩa là chưa có tường ở khu vực đó (+1 điểm)
						this.scoreCounter.increase(new Position(x, y), 1);
						break;
					case 0:
						break;
					default: // Mặc định thì không biết được nên bonus luôn (+0.5 điểm)
						this.scoreCounter.increase(new Position(x, y), 0.5);
				}

				for (const p of pos.upperLeftUpperRightLowerLeftLowerRight()) {
					if (this.hashedWalls.exist(p) && this.hashedWalls.read(p)!.side == side) {
						this.scoreCounter.increase(pos, 0.25);
					}
				}

				// Nếu có lâu đài thì ưu tiên xây xung quanh lâu đài
				if (this.hashedCastles.exist(pos)) this.scoreCounter.increase(pos, 1.5);

				const distance = this.TEMPLATE_WIDTH - 1;

				for (let i = x - distance; i < x + distance; i++) {
					for (let j = y - distance; j < y + distance; j++) {
						const p = new Position(i, j);
						if (!this.hashedWalls.exist(p)) continue;
						if (this.hashedWalls.read(p)!.side === side) this.scoreCounter.increase(pos, 0.125);
						// else this.scoreCounter.decrease(pos, 0.125);
					}
				}
			}
		}

		// Khúc này chuyển thành mảng để sử dụng bên ngoài
		this.buildPositions = this.hashedBuildPositions.toList();
		this.destroyPositions = this.hashedDestroyPositions.toList();
		this.scorePositions = this.scoreCounter.toList();
	}

	/**
	 * @description Hàm này kiểm tra xem có thể xây tường ở vị trí pos không
	 * @param pos - Vị trí cần kiểm tra
	 * @param ownSide - Bên mình
	 * @returns True nếu có thể xây, false nếu không thể xây
	 */
	private checkCreate(pos: Position, ownSide: EWallSide): boolean {
		const needCondition =
			this.HASHED_BUILD_TEMPLATE.exist(
				new Position(pos.x % (this.TEMPLATE_WIDTH - 1), pos.y % (this.TEMPLATE_HEIGHT - 1)),
			) || // * Chia chia gì đó, thử đi rồi biết
			pos.x == this.width - 1 || // * Nếu ở gần biên thì xây luôn
			pos.y == this.height - 1;

		if (!needCondition) return false;

		// * Nếu ở gần đối phương thì chạy
		const nearEne = pos
			.topRightBottomLeft()
			.some((pos) => this.hashedCraftmens.exist(pos) && this.hashedCraftmens.read(pos)!.side !== ownSide);

		if (nearEne) return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.isInSide(pos, ownSide)) return false;

		return true;
	}

	/**
	 * @description Hàm này kiểm tra xem có thể xây tường ở vị trí pos không
	 * @param pos - Vị trí cần kiểm tra
	 * @param ownSide - Bên mình
	 * @returns True nếu không thể xây, false nếu có thể xây
	 */
	private checkNotCreate(pos: Position, ownSide: EWallSide): boolean {
		if (this.hashedWalls.exist(pos)) return true;
		if (this.hashedCastles.exist(pos)) return true;
		if (this.hashedPonds.exist(pos)) return true;
		if (this.hashedCraftmens.exist(pos)) return true;
		if (this.isInSide(pos, ownSide)) return true;

		// // * Nếu sẽ xây gần chỗ đó thì thôi không xây nữa
		// const nearInBuild = pos
		// 	.topRightBottomLeft()
		// 	.some(
		// 		(p) =>
		// 			this.hashedBuildPositions.exist(p) ||
		// 			(this.hashedWalls.exist(p) && this.hashedWalls.read(p)!.side === ownSide),
		// 	);
		// if (nearInBuild) return true;

		// * Nếu ở gần đối phương thì chạy
		const nearEne = pos
			.topRightBottomLeft()
			.some((pos) => this.hashedCraftmens.exist(pos) && this.hashedCraftmens.read(pos)!.side !== ownSide);
		if (nearEne) return true;

		return false;
	}

	/**
	 * @description Hàm này kiểm tra xem có thể phá tường ở vị trí pos không
	 * @param pos - Vị trí cần kiểm tra
	 * @param ownSide - Bên mình
	 * @returns True nếu có thể phá, false nếu không thể phá
	 */
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

		// const bonus = new HashedType<number>();
		const stack = [new Position(craftmen.x, craftmen.y)];
		const bonusVisited = new HashedType<boolean>();

		for (; stack.length; ) {
			const pos = stack.pop()!;
			if (bonusVisited.exist(pos)) continue;
			bonusVisited.write(pos, true);

			if (!pos.isValid(this.width, this.height)) continue;
			if (this.hashedWalls.exist(pos) && this.hashedWalls.read(pos)!.side !== craftmen.side) continue;
			if (this.hashedBuildPositions.exist(pos)) continue;
			if (!pos.topRightBottomLeft().some((p) => this.hashedBuildPositions.exist(p))) continue;

			const builds = pos.topRightBottomLeft().filter((p) => this.hashedBuildPositions.exist(p)).length;

			this.scoreCounter.write(pos, 1 / builds);
		}

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

	// // Return the closest castle (can be null)
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
