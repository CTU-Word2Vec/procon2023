import IHashedDataType from '../interfaces/IHashedDataType';
import IHashedType from '../interfaces/IHashedType';
import IPositionData from '../interfaces/IPositionData';
import Position from './Position';

/**
 * @description Hashed type
 * @template T - Data type
 */
export default class HashedType<T> implements IHashedType<T> {
	/**
	 * @description Data
	 */
	private data: IHashedDataType<T>;

	/**
	 * @description Hashed type
	 */
	constructor(initialData?: Position[], initElement?: T) {
		this.data = {};

		if (!initialData) return;
		if (!initElement) throw new Error('initElement is required when initialData is provided');

		for (const pos of initialData) {
			this.write(pos, initElement);
		}
	}

	public exist(pos: Position): boolean {
		return !!this.data[pos.x]?.[pos.y];
	}

	public read(pos: Position): T | null {
		// If the x position does not exist, return null
		if (!this.data[pos.x]) return null;

		return this.data[pos.x]![pos.y];
	}

	public write(pos: Position, t: T) {
		if (!this.data[pos.x]) {
			// If the x position does not exist, create it
			this.data[pos.x] = {};
		}

		this.data[pos.x]![pos.y] = t;
	}

	public remove(pos: Position) {
		// If the x position does not exist, do nothing
		if (!this.exist(pos)) return;

		this.data[pos.x]![pos.y] = null;
	}

	public getBaseHashedType(): IHashedDataType<T> {
		return this.data;
	}

	public toList(): IPositionData<T>[] {
		// Initialize result
		const result: IPositionData<T>[] = [];

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

	public clone(): HashedType<T> {
		const data = JSON.parse(JSON.stringify(this.data));

		const clonedObject = new HashedType<T>();
		clonedObject.data = data;

		return clonedObject;
	}
}
