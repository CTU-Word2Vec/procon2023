import Action from './Action';
import BaseModel from './BaseModel';

export default interface GameAction extends BaseModel {
	turn: number;
	team_id: number;
	game_id: number;
	created_time: Date | string;
	actions: Action[];
	disabled?: boolean;
}
