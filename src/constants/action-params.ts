type EBaseActionParam = 'LEFT' | 'RIGHT';
export type EMoveParam = EBaseActionParam | 'UP' | 'DOWN' | 'UPPER_LEFT' | 'UPPER_RIGHT' | 'LOWER_LEFT' | 'LOWER_RIGHT';
export type EBuildDestroyParam = EBaseActionParam | 'ABOVE' | 'BELOW';
export type EActionParam = EMoveParam | EBuildDestroyParam;

/**
 * @description Build or destroy action params (ABOVE, RIGHT, BELOW, LEFT)
 */
export const buildDestroyActionParams: EBuildDestroyParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];

export const reverseBuildDestroyActionParams: {
	[key in EBuildDestroyParam]: EBuildDestroyParam;
} = {
	ABOVE: 'BELOW',
	RIGHT: 'LEFT',
	BELOW: 'ABOVE',
	LEFT: 'RIGHT',
};

/**
 * @description Move action params (UP, DOWN, LEFT, RIGHT, UPPER_LEFT, UPPER_RIGHT, LOWER_LEFT, LOWER_RIGHT)
 */
export const moveParams: EMoveParam[] = [
	'UP',
	'RIGHT',
	'DOWN',
	'LEFT',
	'UPPER_LEFT',
	'UPPER_RIGHT',
	'LOWER_LEFT',
	'LOWER_RIGHT',
];

export const reverseMoveParams: {
	[key in EMoveParam]: EMoveParam;
} = {
	UP: 'DOWN',
	RIGHT: 'LEFT',
	DOWN: 'UP',
	LEFT: 'RIGHT',
	UPPER_LEFT: 'LOWER_RIGHT',
	UPPER_RIGHT: 'LOWER_LEFT',
	LOWER_LEFT: 'UPPER_RIGHT',
	LOWER_RIGHT: 'UPPER_LEFT',
};
