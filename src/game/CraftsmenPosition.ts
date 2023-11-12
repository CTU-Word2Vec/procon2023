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

	public getActionToGoToPosition(pos: Position): ActionDto {
		const action: ActionDto = {
			action: 'MOVE',
			craftsman_id: this.id,
		};

		if (pos.x == this.x) {
			if (pos.y == this.y) {
				action.action = 'STAY';
			}

			if (pos.y < this.y) {
				action.action_param = 'UP';
			}

			if (pos.y > this.y) {
				action.action_param = 'DOWN';
			}
		}

		if (pos.x > this.x) {
			if (pos.y == this.y) {
				action.action_param = 'RIGHT';
			}

			if (pos.y < this.y) {
				action.action_param = 'UPPER_RIGHT';
			}

			if (pos.y > this.y) {
				action.action_param = 'LOWER_RIGHT';
			}
		}

		if (pos.x < this.x) {
			if (pos.y == this.y) {
				action.action_param = 'LEFT';
			}

			if (pos.y < this.y) {
				action.action_param = 'UPPER_LEFT';
			}

			if (pos.y > this.y) {
				action.action_param = 'LOWER_LEFT';
			}
		}

		return action;
	}
}
