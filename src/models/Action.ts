import BaseModel from './BaseModel';

export default interface Action extends BaseModel {
	action: string;
	action_param: string;
	craftsman_id: string;
	action_id: number;
}
