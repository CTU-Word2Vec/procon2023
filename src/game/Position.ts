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

	above(): Position {
		return new Position(this.x, this.y - 1);
	}

	below() {
		return new Position(this.x, this.y + 1);
	}

	up() {
		return this.above();
	}

	down() {
		return this.below();
	}

	left() {
		return new Position(this.x - 1, this.y);
	}

	right() {
		return new Position(this.x + 1, this.y);
	}

	upperLeft() {
		return new Position(this.x - 1, this.y - 1);
	}

	upperRight() {
		return new Position(this.x + 1, this.y - 1);
	}

	lowerLeft() {
		return new Position(this.x - 1, this.y + 1);
	}

	lowerRight() {
		return new Position(this.x + 1, this.y + 1);
	}

	isValid(width: number, height: number): boolean {
		if (this.x < 0 || this.y < 0) return false;
		if (this.x >= width || this.y >= height) return false;

		return true;
	}
}
