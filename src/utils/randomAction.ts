import { EAction } from '@/constants/action';
import { EBuildDestryParam, EMoveParam } from '@/constants/action-params';

const actions: EAction[] = ['BUILD', 'DESTROY', 'MOVE', 'STAY'];
const moveParams: EMoveParam[] = [
	'DOWN',
	'LEFT',
	'LOWER_LEFT',
	'LOWER_RIGHT',
	'RIGHT',
	'UP',
	'UPPER_LEFT',
	'UPPER_RIGHT',
];
const buildDestroyParams: EBuildDestryParam[] = ['ABOVE', 'BELOW', 'LEFT', 'RIGHT'];

export default function randomAction(craftsman_id: string) {
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
				action_param: buildDestroyParams[Math.floor(Math.random() * buildDestroyParams.length)],
				action,
			};
		case 'STAY':
			return {
				craftsman_id,
				action,
			};
	}
}
