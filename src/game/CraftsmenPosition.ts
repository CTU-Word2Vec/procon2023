import { EMoveParam } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { IPosition, Position } from './Position';

/**
 * @description Craftsmen position
 */
export interface ICraftsmenPosition extends IPosition {
	/**
	 * @description Craftsmen Id
	 */
	id: string;

	/**
	 * @description Craftsmen side
	 */
	side: 'A' | 'B';
}

/**
 * @description Craftsmen position
 * @extends Position
 * @implements ICraftsmenPosition
 */
export class CraftsmenPosition extends Position implements ICraftsmenPosition {
	public id: string;
	public side: 'A' | 'B';

	/**
	 * @description Craftsmen position
	 * @param x - X position
	 * @param y - Y position
	 * @param id - Id of the craftsman
	 * @param side - Side of the craftsman
	 */
	constructor(x: number, y: number, id: string, side: 'A' | 'B') {
		// Call the parent constructor
		super(x, y);

		// Set the id and side
		this.id = id;
		this.side = side;
	}

	/**
	 * @description Create a move action for the craftsman
	 * @param param - Move param
	 * @returns Move action
	 */
	public moveAction(param: EMoveParam): ActionDto {
		return {
			craftsman_id: this.id,
			action: 'MOVE',
			action_param: param,
		};
	}

	/**
	 * @description Create a move up action for the craftsman
	 * @returns Move up action
	 */
	public moveUpAction(): ActionDto {
		return this.moveAction('UP');
	}

	/**
	 * @description Create a move down action for the craftsman
	 * @returns Move down action
	 */
	public moveDownAction(): ActionDto {
		return this.moveAction('DOWN');
	}

	/**
	 * @description Create a move left action for the craftsman
	 * @returns Move left action
	 */
	public moveLeftAction(): ActionDto {
		return this.moveAction('LEFT');
	}

	/**
	 * @description Create a move right action for the craftsman
	 * @returns Move right action
	 */
	public moveRightAction(): ActionDto {
		return this.moveAction('RIGHT');
	}

	/**
	 * @description Create a move upper left action for the craftsman
	 * @returns Move upper left action
	 */
	public moveUpperLeftAction(): ActionDto {
		return this.moveAction('UPPER_LEFT');
	}

	/**
	 * @description Create a move upper right action for the craftsman
	 * @returns Move upper right action
	 */
	public moveUpperRightAction(): ActionDto {
		return this.moveAction('UPPER_RIGHT');
	}

	/**
	 * @description Create a move lower left action for the craftsman
	 * @returns Move lower left action
	 */
	public moveLowerLeftAction(): ActionDto {
		return this.moveAction('LOWER_LEFT');
	}

	/**
	 * @description Create a move lower right action for the craftsman
	 * @returns Move lower right action
	 */
	public moveLowerRightAction(): ActionDto {
		return this.moveAction('LOWER_RIGHT');
	}

	/**
	 * @description Get all move actions for the craftsman
	 * @returns All move actions (up, down, left, right, upper left, upper right, lower left, lower right)
	 */
	public getAllMoveActions(): ActionDto[] {
		return [
			this.moveUpAction(),
			this.moveDownAction(),
			this.moveLeftAction(),
			this.moveRightAction(),
			this.moveUpperLeftAction(),
			this.moveUpperRightAction(),
			this.moveLowerLeftAction(),
			this.moveLowerRightAction(),
		];
	}

	/**
	 * @description Get all move actions for the craftsman
	 * @param pos - Position to go to
	 * @returns List of actions to go to the position
	 */
	public getNextActionsToGoToPosition(pos: Position): ActionDto[] {
		// Get all move actions
		const [up, down, left, right, upperLeft, upperRight, lowerLeft, lowerRight] = this.getAllMoveActions();

		if (pos.x === this.x) {
			if (pos.y < this.y) {
				// If the position is above the craftsman position (y < this.y) then the order is up, upper left, upper right, left, right, lower left, lower right, down
				return [up, upperLeft, upperRight, left, right, lowerLeft, lowerRight, down];
			}

			if (pos.y > this.y) {
				// If the position is below the craftsman position (y > this.y) then the order is down, lower left, lower right, left, right, upper left, upper right, up
				return [down, lowerLeft, lowerRight, left, right, upperLeft, upperRight, up];
			}
		}

		if (pos.y === this.y) {
			if (pos.x < this.x) {
				// If the position is to the left of the craftsman position (x < this.x) then the order is left, upper left, lower left, up, down, upper right, lower right, right
				return [left, upperLeft, lowerLeft, up, down, upperRight, lowerRight, right];
			}

			if (pos.x > this.x) {
				// If the position is to the right of the craftsman position (x > this.x) then the order is right, upper right, lower right, up, down, upper left, lower left, left
				return [right, upperRight, lowerRight, up, down, upperLeft, lowerLeft, left];
			}
		}

		if (pos.x < this.x && pos.y < this.y) {
			// If the position is to the upper left of the craftsman position (x < this.x && y < this.y) then the order is upper left, left, up, upper right, lower left, lower right, right, down
			return [upperLeft, left, up, upperRight, lowerLeft, lowerRight, right, down];
		}

		if (pos.x > this.x && pos.y < this.y) {
			// If the position is to the upper right of the craftsman position (x > this.x && y < this.y) then the order is upper right, right, up, upper left, lower right, lower left, left, down
			return [upperRight, right, up, upperLeft, lowerRight, lowerLeft, left, down];
		}

		if (pos.x < this.x && pos.y > this.y) {
			// If the position is to the lower left of the craftsman position (x < this.x && y > this.y) then the order is lower left, left, down, lower right, upper left, upper right, right, up
			return [lowerLeft, left, down, lowerRight, upperLeft, upperRight, right, up];
		}

		if (pos.x > this.x && pos.y > this.y) {
			// If the position is to the lower right of the craftsman position (x > this.x && y > this.y) then the order is lower right, right, down, lower left, upper right, upper left, left, up
			return [lowerRight, right, down, lowerLeft, upperRight, upperLeft, left, up];
		}

		return [];
	}
}
