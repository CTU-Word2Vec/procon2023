import BasePosition from './BasePosition';

/**
 * @description Position interface
 * @extends BasePosition
 */
export default interface IPosition extends BasePosition {
	/**
	 * @description Get position above
	 * @returns Above postion
	 */
	above();

	/**
	 * @description Get position below
	 * @returns Below position
	 */
	below();

	/**
	 * @description Get position up
	 * @returns Position up
	 */
	up();

	/**
	 * @description Get position down
	 * @returns Position down
	 */
	down();

	/**
	 * @description Get left position
	 * @returns Left position
	 */
	left();

	/**
	 * @description Get right position
	 * @returns Right position
	 */
	right();

	/**
	 * @description Get upper left position
	 * @returns Upper left position
	 */
	upperLeft();

	/**
	 * @description Get upper right position
	 * @returns Upper right position
	 */
	upperRight();

	/**
	 * @description Get lower left position
	 * @returns Lower left position
	 */
	lowerLeft();

	/**
	 * @description Get lower right position
	 * @returns Lower right position
	 */
	lowerRight();

	/**
	 * @description Check if the position is valid
	 * @param width The width of the map
	 * @param height The height of the map
	 * @returns Whether the position is valid
	 */
	isValid(width: number, height: number): boolean;

	/**
	 * @description Get position by action param
	 * @param param Action param
	 * @returns Position by action param
	 */
	getPositionByActionParam(param: EActionParam);

	/**
	 * @description Get 4 positions (top, right, bottom, left)
	 * @returns List of positions
	 */
	topRightBottomLeft();

	/**
	 * @description Get 4 positions (upper left, upper right, lower right, lower left)
	 * @returns List of positions
	 */
	upperLeftUpperRightLowerRightLowerLeft();

	/**
	 * @description Get 8 positions (top, right, bottom, left, upper left, upper right, lower right, lower left)
	 * @returns List of positions
	 */
	allNears();

	/**
	 * @description Get distance between two positions
	 * @param pos Position to calculate distance
	 * @param formular Formular to calculate distance (mahata, euclid)
	 * @returns Distance between two positions
	 */
	distance(pos: Position, formular: 'mahata' | 'euclid' = 'mahata'): number;

	/**
	 * @description Check if the position is near
	 * @param pos Position to check
	 * @returns Whether the position is near
	 */
	isNear(pos: Position): boolean;

	/**
	 * @description Check if the position is equal
	 * @param pos Position to check
	 * @returns Whether the position is equal
	 */
	equals(pos: Position): boolean;
}
