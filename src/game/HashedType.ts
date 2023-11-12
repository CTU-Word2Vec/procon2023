import { Position } from './Position';

export class HashedType<T> {
	private data: {
		[x: number]: {
			[y: number]: T | null;
		} | null;
	};

	constructor() {
		this.data = {};
	}

	public exist(pos: Position): boolean {
		return !!this.data[pos.x]?.[pos.y];
	}

	public read(pos: Position): T | null {
		if (!this.data[pos.x]) return null;

		return this.data[pos.x]![pos.y];
	}

	public write(pos: Position, t: T) {
		if (!this.data[pos.x]) {
			this.data[pos.x] = {};
		}

		this.data[pos.x]![pos.y] = t;
	}

	public remove(pos: Position) {
		if (!this.exist(pos)) return;

		this.data[pos.x]![pos.y] = null;
	}
}
