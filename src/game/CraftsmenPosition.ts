import { EMoveParam } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { IPosition, Position } from './Position';

export interface ICraftsmenPosition extends IPosition {
	id: string;
	side: 'A' | 'B';
}

export class CraftsmenPosition extends Position implements ICraftsmenPosition {
	public id: string;
	public side: 'A' | 'B';

	constructor(x: number, y: number, id: string, side: 'A' | 'B') {
		super(x, y);
		this.id = id;
		this.side = side;
	}

	public moveAction(param: EMoveParam): ActionDto {
		return {
			craftsman_id: this.id,
			action: 'MOVE',
			action_param: param,
		};
	}

	public moveUpAction(): ActionDto {
		return this.moveAction('UP');
	}

	public moveDownAction(): ActionDto {
		return this.moveAction('DOWN');
	}

	public moveLeftAction(): ActionDto {
		return this.moveAction('LEFT');
	}

	public moveRightAction(): ActionDto {
		return this.moveAction('RIGHT');
	}

	public moveUpperLeftAction(): ActionDto {
		return this.moveAction('UPPER_LEFT');
	}

	public moveUpperRightAction(): ActionDto {
		return this.moveAction('UPPER_RIGHT');
	}

	public moveLowerLeftAction(): ActionDto {
		return this.moveAction('LOWER_LEFT');
	}

	public moveLowerRightAction(): ActionDto {
		return this.moveAction('LOWER_RIGHT');
	}

	public allMoveActions(): ActionDto[] {
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

	public getActionsToGoToPosition(pos: Position): ActionDto[] {
		const [up, down, left, right, upperLeft, upperRight, lowerLeft, lowerRight] = this.allMoveActions();

		if (pos.x === this.x) {
			if (pos.y < this.y) {
				return [up, upperLeft, upperRight, left, right, lowerLeft, lowerRight, down];
			}

			if (pos.y > this.y) {
				return [down, lowerLeft, lowerRight, left, right, upperLeft, upperRight, up];
			}
		}

		if (pos.y === this.y) {
			if (pos.x < this.x) {
				return [left, upperLeft, lowerLeft, up, down, upperRight, lowerRight, right];
			}

			if (pos.x > this.x) {
				return [right, upperRight, lowerRight, up, down, upperLeft, lowerLeft, left];
			}
		}

		if (pos.x < this.x && pos.y < this.y) {
			return [upperLeft, left, up, upperRight, lowerLeft, lowerRight, right, down];
		}

		if (pos.x > this.x && pos.y < this.y) {
			return [upperRight, right, up, upperLeft, lowerRight, lowerLeft, left, down];
		}

		if (pos.x < this.x && pos.y > this.y) {
			return [lowerLeft, left, down, lowerRight, upperLeft, upperRight, right, up];
		}

		if (pos.x > this.x && pos.y > this.y) {
			return [lowerRight, right, down, lowerLeft, upperRight, upperLeft, left, up];
		}

		return [];
	}
}
