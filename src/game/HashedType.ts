import { Position } from './Position';

export type BaseHashedType<T> = {
	[x: number]: {
		[y: number]: T | null;
	} | null;
};

export interface PositionData<T> {
	x: number;
	y: number;
	data: T;
}

export class HashedType<T> {
	private data: BaseHashedType<T>;

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

	public getBaseHashedType(): BaseHashedType<T> {
		return this.data;
	}

	public toList(): PositionData<T>[] {
		const result: PositionData<T>[] = [];

		const xKeys = Object.keys(this.data) as unknown as number[];

		for (const x of xKeys) {
			if (!this.data[x]) continue;

			const yKeys = Object.keys(this.data[x]!) as unknown as number[];

			for (const y of yKeys) {
				if (!this.data[x]![y]) continue;

				result.push({
					x,
					y,
					data: this.data[x]![y]!,
				});
			}
		}

		return result;
	}
}
