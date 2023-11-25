import { EBuildDestryParam, EMoveParam } from '@/constants';
import { ActionDto } from '@/services';
import { EWallSide } from '../enums/EWallSide';
import IPosition from './IPosition';

/**
 * @description Craftsmen position
 * @extends IPosition
 */
export default interface ICraftsmenPosition extends IPosition {
	/**
	 * @description Craftsmen Id
	 */
	id: string;

	/**
	 * @description Craftsmen side
	 */
	side: EWallSide;

	/**
	 * @description Create a move action for the craftsman
	 * @param param - Move param
	 * @returns Move action
	 */
	moveAction(param: EMoveParam);

	/**
	 * @description Create a move up action for the craftsman
	 * @returns Move up action
	 */
	moveUpAction();

	/**
	 * @description Create a move down action for the craftsman
	 * @returns Move down action
	 */
	moveDownAction();
	/**
	 * @description Create a move left action for the craftsman
	 * @returns Move left action
	 */
	moveLeftAction();

	/**
	 * @description Create a move right action for the craftsman
	 * @returns Move right action
	 */
	moveRightAction();

	/**
	 * @description Create a move upper left action for the craftsman
	 * @returns Move upper left action
	 */
	moveUpperLeftAction();

	/**
	 * @description Create a move upper right action for the craftsman
	 * @returns Move upper right action
	 */
	moveUpperRightAction();

	/**
	 * @description Create a move lower left action for the craftsman
	 * @returns Move lower left action
	 */
	moveLowerLeftAction();

	/**
	 * @description Create a move lower right action for the craftsman
	 * @returns Move lower right action
	 */
	moveLowerRightAction();

	/**
	 * @description Get all move actions for the craftsman
	 * @returns All move actions (up, down, left, right, upper left, upper right, lower left, lower right)
	 */
	getAllMoveActions();

	/**
	 * @description Get all move actions for the craftsman
	 * @param pos - Position to go to
	 * @returns List of actions to go to the position
	 */
	getNextActionsToGoToPosition(pos: Position);

	/**
	 * @description Get stay action
	 * @returns Stay action
	 */
	getStayAction(): ActionDto;

	/**
	 * @description Get build action
	 * @param param - Build action param
	 * @returns Build action
	 */
	getBuildAction(param: EBuildDestryParam): ActionDto;

	/**
	 * @description Get move action
	 * @param param - Move action param
	 * @returns Move action
	 */
	getMoveAction(param: EMoveParam): ActionDto;

	/**
	 * @description Get destroy action
	 * @param param - Destroy action param
	 * @returns Destroy action
	 */
	getDestroyAction(param: EBuildDestryParam): ActionDto;
}
