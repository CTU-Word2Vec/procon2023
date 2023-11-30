import IPositionData from './IPositionData';

/**
 * @description Hashed type
 * @template T - Data type
 */
export default interface IHashedType<T> {
	/**
	 * @description Existence
	 * @param pos - Position
	 * @returns  Existence
	 */
	exist(pos: Position): boolean;

	/**
	 * @description Read data
	 * @param pos - Position
	 * @returns Data
	 */
	read(pos: Position): T | null;

	/**
	 * @description Write data
	 * @param pos - Position
	 * @param t - Data
	 */
	write(pos: Position, t: T): void;

	/**
	 * @description Remove data
	 * @param pos - Position
	 */
	remove(pos: Position): void;

	/**
	 * @description Get base hashed type
	 * @returns Base hashed type
	 */
	getBaseHashedType();

	/**
	 * @description Set base hashed type
	 * @returns - List of position data
	 */
	toList(): IPositionData<T>[];

	/**
	 * @description Copy this object
	 * @returns New object copied from this
	 */
	clone(): IHashedType<T>;
}
