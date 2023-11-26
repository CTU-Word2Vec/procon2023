import Action from '@/models/Action';

const orderMap = {
	STAY: 1,
	DESTROY: 2,
	BUILD: 3,
	MOVE: 4,
};

/**
 * @description Sort actions by order of execution (STAY -> DESTROY -> BUILD -> MOVE)
 * @param actions Actions to sort
 * @returns Sorted actions
 * @example
 * const actions = [
 * 	{
 * 		craftsman_id: '1',
 * 		action: 'BUILD',
 * 		action_param: 'BELOW',
 * 	},
 * 	{
 * 		craftsman_id: '2',
 * 		action: 'MOVE',
 * 		action_param: 'UPPER_RIGHT',
 * 	},
 * 	{
 * 		craftsman_id: '3',
 * 		action: 'STAY',
 * 	},
 * ];
 *
 * sortActions(actions);
 * // [
 * // 	{
 * // 		craftsman_id: '3',
 * // 		action: 'STAY',
 * // 	},
 * // 	{
 * // 		craftsman_id: '1',
 * // 		action: 'BUILD',
 * // 		action_param: 'BELOW',
 * // 	},
 * // 	{
 * // 		craftsman_id: '2',
 * // 		action: 'MOVE',
 * // 		action_param: 'UPPER_RIGHT',
 * // 	},
 * // ]
 */
export default function sortActions(actions: Action[]) {
	return [...actions].sort((a, b) => orderMap[a.action] - orderMap[b.action]);
}
