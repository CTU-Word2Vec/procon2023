import { EActionParam } from '@/constants/action-params';

export interface IPosition {
	x: number;
	y: number;
}

export class Position implements IPosition {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public above(): Position {
		return new Position(this.x, this.y - 1);
	}

	public below(): Position {
		return new Position(this.x, this.y + 1);
	}

	public up(): Position {
		return this.above();
	}

	public down(): Position {
		return this.below();
	}

	public left(): Position {
		return new Position(this.x - 1, this.y);
	}

	public right(): Position {
		return new Position(this.x + 1, this.y);
	}

	public upperLeft(): Position {
		return new Position(this.x - 1, this.y - 1);
	}

	public upperRight(): Position {
		return new Position(this.x + 1, this.y - 1);
	}

	public lowerLeft(): Position {
		return new Position(this.x - 1, this.y + 1);
	}

	public lowerRight(): Position {
		return new Position(this.x + 1, this.y + 1);
	}

	public isValid(width: number, height: number): boolean {
		if (this.x < 0 || this.y < 0) return false;
		if (this.x >= width || this.y >= height) return false;

		return true;
	}

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

	public topRightBottomLeft(): [Position, Position, Position, Position] {
		return [this.up(), this.right(), this.down(), this.left()];
	}

	public upperLeftUpperRightLowerRightLowerLeft(): [Position, Position, Position, Position] {
		return [this.upperLeft(), this.upperRight(), this.lowerRight(), this.lowerLeft()];
	}

	public allNears(): [Position, Position, Position, Position, Position, Position, Position, Position] {
		return [...this.topRightBottomLeft(), ...this.upperLeftUpperRightLowerRightLowerLeft()];
	}

	public distance(pos: Position, formular: 'mahata' | 'euclid' = 'mahata'): number {
		switch (formular) {
			case 'mahata':
				return this.manhattanDistance(pos);
			case 'euclid':
				return this.euclideanDistance(pos);
		}
	}

	public manhattanDistance(pos: Position): number {
		return Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y);
	}

	public euclideanDistance(pos: Position): number {
		return Math.sqrt(Math.pow(this.x - pos.x, 2) + Math.pow(this.y - pos.y, 2));
	}

	public isNear(pos: Position): boolean {
		return this.distance(pos) === 1;
	}

	public equals(pos: Position): boolean {
		return this.x === pos.x && this.y === pos.y;
	}

	public static random(width: number, height: number) {
		width -= 2;
		height -= 2;

		const x = Math.floor(Math.random() * width) + 1;
		const y = Math.floor(Math.random() * height) + 1;

		return new Position(x, y);
	}
}
