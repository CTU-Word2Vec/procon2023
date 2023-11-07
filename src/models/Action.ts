import BaseModel from './BaseModel';

export default interface Action extends BaseModel {
	action: 'MOVE' | 'BUILD' | 'STAY' | 'DESTROY';
	action_param?:
		| 'UP'
		| 'DOWN'
		| 'LEFT'
		| 'RIGHT'
		| 'UPPER_LEFT'
		| 'UPPER_RIGHT'
		| 'LOWER_LEFT'
		| 'LOWER_RIGHT'
		| 'ABOVE'
		| 'BELOW';
	craftsman_id: string;
	action_id: number;
}
