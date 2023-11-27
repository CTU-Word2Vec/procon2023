type EBaseActionParam = 'LEFT' | 'RIGHT';
export type EMoveParam = EBaseActionParam | 'UP' | 'DOWN' | 'UPPER_LEFT' | 'UPPER_RIGHT' | 'LOWER_LEFT' | 'LOWER_RIGHT';
export type EBuildDestryParam = EBaseActionParam | 'ABOVE' | 'BELOW';
export type EActionParam = EMoveParam | EBuildDestryParam;

export const buildDestroyActionParams: EBuildDestryParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];
export const moveParams: EMoveParam[] = [
	'UP',
	'DOWN',
	'LEFT',
	'RIGHT',
	'UPPER_LEFT',
	'UPPER_RIGHT',
	'LOWER_LEFT',
	'LOWER_RIGHT',
];
