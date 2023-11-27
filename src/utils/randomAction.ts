import { actions } from '@/constants/action';
import { buildDestroyActionParams, moveParams } from '@/constants/action-params';
import { ActionDto } from '@/services';

/**
 * @description Random action
 * @param craftsman_id - Craftsman id
 * @returns - Action
 */
export default function randomAction(craftsman_id: string): ActionDto {
	const action = actions[Math.floor(Math.random() * actions.length)];

	switch (action) {
		case 'MOVE':
			return {
				craftsman_id,
				action_param: moveParams[Math.floor(Math.random() * moveParams.length)],
				action,
			};
		case 'BUILD':
		case 'DESTROY':
			return {
				craftsman_id,
				action_param: buildDestroyActionParams[Math.floor(Math.random() * buildDestroyActionParams.length)],
				action,
			};
		case 'STAY':
			return {
				craftsman_id,
				action,
			};
	}
}
