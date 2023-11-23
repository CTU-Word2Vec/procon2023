/**
 * @description Position data
 * @template T - Data type
 */
export default interface PositionData<T> {
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
