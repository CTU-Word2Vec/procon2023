export type EMoveParam = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'UPPER_LEFT' | 'UPPER_RIGHT' | 'LOWER_LEFT' | 'LOWER_RIGHT';
export type EBuildDestryParam = 'LEFT' | 'RIGHT' | 'ABOVE' | 'BELOW';
export type EActionParam = EMoveParam | EBuildDestryParam;

export const buildDestroyActionParams: EBuildDestryParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];
export const moveParams: EMoveParam[] = [
	'DOWN',
	'LEFT',
	'LOWER_LEFT',
	'LOWER_RIGHT',
	'RIGHT',
	'UP',
	'UPPER_LEFT',
	'UPPER_RIGHT',
];
