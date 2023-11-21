import { EActionParam } from '@/constants/action-params';

/**
 * @description Position interface
 */
export interface IPosition {
	/**
	 * @description X position
	 */
	x: number;
	/**
	 * @description Y position
	 */
	y: number;
}

/**
 * @description Position class
 * @implements IPosition
 */
export class Position implements IPosition {
	public x: number;
	public y: number;

	/**
	 * @description Position constructor
	 * @constructor
	 * @param x Position X
	 * @param y Position Y
	 */
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	/**
	 * @description Get position above
	 * @returns Above postion
	 */
	public above(): Position {
		return new Position(this.x, this.y - 1);
	}

	/**
	 * @description Get position below
	 * @returns Below position
	 */
	public below(): Position {
		return new Position(this.x, this.y + 1);
	}

	/**
	 * @description Get position up
	 * @returns Position up
	 */
	public up(): Position {
		return this.above();
	}

	/**
	 * @description Get position down
	 * @returns Position down
	 */
	public down(): Position {
		return this.below();
	}

	/**
	 * @description Get left position
	 * @returns Left position
	 */
	public left(): Position {
		return new Position(this.x - 1, this.y);
	}

	/**
	 * @description Get right position
	 * @returns Right position
	 */
	public right(): Position {
		return new Position(this.x + 1, this.y);
	}

	/**
	 * @description Get upper left position
	 * @returns Upper left position
	 */
	public upperLeft(): Position {
		return new Position(this.x - 1, this.y - 1);
	}

	/**
	 * @description Get upper right position
	 * @returns Upper right position
	 */
	public upperRight(): Position {
		return new Position(this.x + 1, this.y - 1);
	}

	/**
	 * @description Get lower left position
	 * @returns Lower left position
	 */
	public lowerLeft(): Position {
		return new Position(this.x - 1, this.y + 1);
	}

	/**
	 * @description Get lower right position
	 * @returns Lower right position
	 */
	public lowerRight(): Position {
		return new Position(this.x + 1, this.y + 1);
	}

	/**
	 * @description Check if the position is valid
	 * @param width The width of the map
	 * @param height The height of the map
	 * @returns Whether the position is valid
	 */
	public isValid(width: number, height: number): boolean {
		if (this.x < 0 || this.y < 0) return false;
		if (this.x >= width || this.y >= height) return false;

		return true;
	}

	/**
	 * @description Get position by action param
	 * @param param Action param
	 * @returns Position by action param
	 */
	public getPositionByActionParam(param: EActionParam): Position {
		switch (param) {
			case 'UP':
				return this.up();
			case 'DOWN':
				return this.down();
			case 'LEFT':
				return this.left();
			case 'RIGHT':
				return this.right();
			case 'UPPER_LEFT':
				return this.upperLeft();
			case 'UPPER_RIGHT':
				return this.upperRight();
			case 'LOWER_LEFT':
				return this.lowerLeft();
			case 'LOWER_RIGHT':
				return this.lowerRight();
			case 'ABOVE':
				return this.above();
			case 'BELOW':
				return this.below();
			default:
				throw new Error(`Unknown action param (${param})`);
		}
	}

	/**
	 * @description Get 4 positions (top, right, bottom, left)
	 * @returns List of positions
	 */
	public topRightBottomLeft(): [Position, Position, Position, Position] {
		return [this.up(), this.right(), this.down(), this.left()];
	}

	/**
	 * @description Get 4 positions (upper left, upper right, lower right, lower left)
	 * @returns List of positions
	 */
	public upperLeftUpperRightLowerRightLowerLeft(): [Position, Position, Position, Position] {
		return [this.upperLeft(), this.upperRight(), this.lowerRight(), this.lowerLeft()];
	}

	/**
	 * @description Get 8 positions (top, right, bottom, left, upper left, upper right, lower right, lower left)
	 * @returns List of positions
	 */
	public allNears(): [Position, Position, Position, Position, Position, Position, Position, Position] {
		return [...this.topRightBottomLeft(), ...this.upperLeftUpperRightLowerRightLowerLeft()];
	}

	/**
	 * @description Get distance between two positions
	 * @param pos Position to calculate distance
	 * @param formular Formular to calculate distance (mahata, euclid)
	 * @returns Distance between two positions
	 */
	public distance(pos: Position, formular: 'mahata' | 'euclid' = 'mahata'): number {
		switch (formular) {
			case 'mahata':
				return this.manhattanDistance(pos);
			case 'euclid':
				return this.euclideanDistance(pos);
		}
	}

	/**
	 * @description Get Manhattan distance between two positions
	 * @param pos Position to calculate distance
	 * @returns Manhattan distance between two positions
	 */
	private manhattanDistance(pos: Position): number {
		return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
	}

	/**
	 * @description Get Euclidean distance between two positions
	 * @param pos Position to calculate distance
	 * @returns Distance between two positions
	 */
	private euclideanDistance(pos: Position): number {
		return Math.sqrt(Math.pow(this.x - pos.x, 2) + Math.pow(this.y - pos.y, 2));
	}

	/**
	 * @description Check if the position is near
	 * @param pos Position to check
	 * @returns Whether the position is near
	 */
	public isNear(pos: Position): boolean {
		return this.distance(pos) === 1;
	}

	/**
	 * @description Check if the position is equal
	 * @param pos Position to check
	 * @returns Whether the position is equal
	 */
	public equals(pos: Position): boolean {
		return this.x === pos.x && this.y === pos.y;
	}

	/**
	 * @description Get a random position
	 * @param width The width of the map
	 * @param height The height of the map
	 * @returns Randomed position
	 */
	public static random(width: number, height: number) {
		width -= 2;
		height -= 2;

		const x = Math.floor(Math.random() * width) + 1;
		const y = Math.floor(Math.random() * height) + 1;

		return new Position(x, y);
	}
}
