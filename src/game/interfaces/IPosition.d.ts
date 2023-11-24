import Position from '../classes/Position';
import IBasePosition from './IBasePosition';

/**
 * @description Position interface
 * @extends IBasePosition
 * @example
 */
export default interface IPosition extends IBasePosition {
	/**
	 * @description Get position above
	 * @returns Above postion
	 * @example
	 * const pos = new Position(1, 1);
	 * const abovePos = pos.above();
	 * console.log(abovePos); // { x: 1, y: 0 }
	 */
	above(): IPosition;

	/**
	 * @description Get position below
	 * @returns Below position
	 * @example
	 * const pos = new Position(1, 1);
	 * const belowPos = pos.below();
	 * console.log(belowPos); // { x: 1, y: 2 }
	 */
	below(): IPosition;

	/**
	 * @description Get position up
	 * @returns Position up
	 * @example
	 * const pos = new Position(1, 1);
	 * const upPos = pos.up();
	 * console.log(upPos); // { x: 0, y: 1 }
	 */
	up(): IPosition;

	/**
	 * @description Get position down
	 * @returns Position down
	 * @example
	 * const pos = new Position(1, 1);
	 * const downPos = pos.down();
	 * console.log(downPos); // { x: 2, y: 1 }
	 */
	down(): IPosition;

	/**
	 * @description Get left position
	 * @returns Left position
	 * @example
	 * const pos = new Position(1, 1);
	 * const leftPos = pos.left();
	 * console.log(leftPos); // { x: 0, y: 1 }
	 */
	left(): IPosition;

	/**
	 * @description Get right position
	 * @returns Right position
	 * @example
	 * const pos = new Position(1, 1);
	 * const rightPos = pos.right();
	 * console.log(rightPos); // { x: 2, y: 1 }
	 */
	right(): IPosition;

	/**
	 * @description Get upper left position
	 * @returns Upper left position
	 * @example
	 * const pos = new Position(1, 1);
	 * const upperLeftPos = pos.upperLeft();
	 * console.log(upperLeftPos); // { x: 0, y: 0 }
	 */
	upperLeft(): IPosition;

	/**
	 * @description Get upper right position
	 * @returns Upper right position
	 * @example
	 * const pos = new Position(1, 1);
	 * const upperRightPos = pos.upperRight();
	 * console.log(upperRightPos); // { x: 2, y: 0 }
	 */
	upperRight(): IPosition;

	/**
	 * @description Get lower left position
	 * @returns Lower left position
	 * @example
	 * const pos = new Position(1, 1);
	 * const lowerLeftPos = pos.lowerLeft();
	 * console.log(lowerLeftPos); // { x: 0, y: 2 }
	 */
	lowerLeft(): IPosition;

	/**
	 * @description Get lower right position
	 * @returns Lower right position
	 * @example
	 * const pos = new Position(1, 1);
	 * const lowerRightPos = pos.lowerRight();
	 */
	lowerRight(): IPosition;

	/**
	 * @description Check if the position is valid
	 * @param width The width of the map
	 * @param height The height of the map
	 * @returns Whether the position is valid
	 * @example
	 * const pos = new Position(1, 1);
	 * const isValid = pos.isValid(10, 10);
	 * console.log(isValid); // true
	 * @example
	 * const pos = new Position(-1, 1);
	 * const isValid = pos.isValid(10, 10);
	 * console.log(isValid); // false
	 */
	isValid(width: number, height: number): boolean;

	/**
	 * @description Get position by action param
	 * @param param Action param
	 * @returns Position by action param
	 * @example
	 * const pos = new Position(1, 1);
	 * const posByActionParam = pos.getPositionByActionParam('UP');
	 * console.log(posByActionParam); // { x: 1, y: 0 }
	 */
	getPositionByActionParam(param: EActionParam): IPosition;

	/**
	 * @description Get 4 positions (top, right, bottom, left)
	 * @returns List of positions
	 * @example
	 * const pos = new Position(1, 1);
	 * const [topPos, rightPos, bottomPos, leftPos] = pos.topRightBottomLeft();
	 * console.log(topPos); // { x: 1, y: 0 }
	 * console.log(rightPos); // { x: 2, y: 1 }
	 * console.log(bottomPos); // { x: 1, y: 2 }
	 * console.log(leftPos); // { x: 0, y: 1 }
	 */
	topRightBottomLeft(): [IPosition, IPosition, IPosition, IPosition];

	/**
	 * @description Get 4 positions (upper left, upper right, lower right, lower left)
	 * @returns List of positions
	 * @example
	 * const pos = new Position(1, 1);
	 * const [upperLeftPos, upperRightPos, lowerRightPos, lowerLeftPos] = pos.upperLeftUpperRightLowerRightLowerLeft();
	 * console.log(upperLeftPos); // { x: 0, y: 0 }
	 * console.log(upperRightPos); // { x: 2, y: 0 }
	 * console.log(lowerRightPos); // { x: 2, y: 2 }
	 * console.log(lowerLeftPos); // { x: 0, y: 2 }
	 */
	upperLeftUpperRightLowerRightLowerLeft(): [IPosition, IPosition, IPosition, IPosition];

	/**
	 * @description Get 8 positions (top, right, bottom, left, upper left, upper right, lower right, lower left)
	 * @returns List of positions
	 * @example
	 * const pos = new Position(1, 1);
	 * const [topPos, rightPos, bottomPos, leftPos, upperLeftPos, upperRightPos, lowerRightPos, lowerLeftPos] = pos.allNears();
	 * console.log(topPos); // { x: 1, y: 0 }
	 * console.log(rightPos); // { x: 2, y: 1 }
	 * console.log(bottomPos); // { x: 1, y: 2 }
	 * console.log(leftPos); // { x: 0, y: 1 }
	 * console.log(upperLeftPos); // { x: 0, y: 0 }
	 * console.log(upperRightPos); // { x: 2, y: 0 }
	 * console.log(lowerRightPos); // { x: 2, y: 2 }
	 * console.log(lowerLeftPos); // { x: 0, y: 2 }
	 */
	allNears(): [IPosition, IPosition, IPosition, IPosition, IPosition, IPosition, IPosition, IPosition];

	/**
	 * @description Get distance between two positions
	 * @param pos Position to calculate distance
	 * @param formular Formular to calculate distance (mahata, euclid)
	 * @returns Distance between two positions
	 * @example
	 * const pos1 = new Position(1, 1);
	 * const pos2 = new Position(1, 2);
	 * const distance = pos1.distance(pos2);
	 * console.log(distance); //  | 1 - 1 | + | 2 - 1 | = 1
	 * @example
	 * const pos1 = new Position(1, 1);
	 * const pos2 = new Position(1, 2);
	 * const distance = pos1.distance(pos2, 'euclid');
	 * console.log(distance); // sqrt((1 - 1) ^ 2 + (2 - 1) ^ 2) = 1
	 */
	distance(pos: Position, formular: 'mahata' | 'euclid' = 'mahata'): number;

	/**
	 * @description Check if the position is near
	 * @param pos Position to check
	 * @returns Whether the position is near
	 * @example
	 * const pos1 = new Position(1, 1);
	 * const pos2 = new Position(1, 2);
	 * const isNear = pos1.isNear(pos2)
	 * console.log(isNear) // true
	 * @example
	 * const pos1 = new Position(1, 1);
	 * const pos2 = new Position(1, 3);
	 * const isNear = pos1.isNear(pos2)
	 * console.log(isNear) // false
	 */
	isNear(pos: Position): boolean;

	/**
	 * @description Check if the position is equal
	 * @param pos Position to check
	 * @returns Whether the position is equal
	 * @example
	 * const pos1 = new Position(1, 1);
	 * const pos2 = new Position(1, 1);
	 * const isEqual = pos1.equals(pos2)
	 * console.log(isEqual) // true
	 */
	isEquals(pos: Position): boolean;
}
