import Action from '@/models/Action';

export const orderMap = {
	STAY: 1,
	DESTROY: 2,
	BUILD: 3,
	MOVE: 4,
};

export default function sortActions(actions: Action[]) {
	return actions.sort((a, b) => orderMap[a.action] - orderMap[b.action]);
}
