/**
 * @description Hashed type
 * @template T Type of data
 */
export default interface BaseHashedType<T> {
	[x: number]: {
		[y: number]: T | null;
	} | null;
}
