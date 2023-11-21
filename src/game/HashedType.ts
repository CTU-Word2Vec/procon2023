import { Position } from './Position';

/**
 * @description Hashed type
 */
export type BaseHashedType<T> = {
	/**
	 * @description X position
	 */
	[x: number]: {
		[y: number]: T | null;
	} | null;
};

/**
 * @description Position data
 * @template T - Data type
 */
export interface PositionData<T> {
	/**
	 * @description X position
	 */
	x: number;
	/**
	 * @description Y position
	 */
	y: number;
	/**
	 * @description Data
	 */
	data: T;
}

/**
 * @description Hashed type
 * @template T - Data type
 */
export class HashedType<T> {
	/**
	 * @description Data
	 */
	private data: BaseHashedType<T>;

	/**
	 * @description Hashed type
	 */
	constructor() {
		this.data = {};
	}

	/**
	 * @description Existence
	 * @param pos - Position
	 * @returns  Existence
	 */
	public exist(pos: Position): boolean {
		return !!this.data[pos.x]?.[pos.y];
	}

	/**
	 * @description Read data
	 * @param pos - Position
	 * @returns Data
	 */
	public read(pos: Position): T | null {
		// If the x position does not exist, return null
		if (!this.data[pos.x]) return null;

		return this.data[pos.x]![pos.y];
	}

	/**
	 * @description Write data
	 * @param pos - Position
	 * @param t - Data
	 */
	public write(pos: Position, t: T) {
		if (!this.data[pos.x]) {
			// If the x position does not exist, create it
			this.data[pos.x] = {};
		}

		this.data[pos.x]![pos.y] = t;
	}

	/**
	 * @description Remove data
	 * @param pos - Position
	 */
	public remove(pos: Position) {
		// If the x position does not exist, do nothing
		if (!this.exist(pos)) return;

		this.data[pos.x]![pos.y] = null;
	}

	/**
	 * @description Get base hashed type
	 * @returns Base hashed type
	 */
	public getBaseHashedType(): BaseHashedType<T> {
		return this.data;
	}

	/**
	 * @description Set base hashed type
	 * @returns - List of position data
	 */
	public toList(): PositionData<T>[] {
		// Initialize result
		const result: PositionData<T>[] = [];

		// Get x keys
		const xKeys = Object.keys(this.data) as unknown as number[];

		for (const x of xKeys) {
			// If the x position does not exist, continue
			if (!this.data[x]) continue;

			// Get y keys
			const yKeys = Object.keys(this.data[x]!) as unknown as number[];

			for (const y of yKeys) {
				// If the y position does not exist, continue
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
