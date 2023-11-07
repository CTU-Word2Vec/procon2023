import { EAction } from '@/constants/action';
import { EActionParam } from '@/constants/action-params';
import BaseModel from './BaseModel';

export default interface Action extends BaseModel {
	action: EAction;
	action_param?: EActionParam;
	craftsman_id: string;
	action_id: number;
}
