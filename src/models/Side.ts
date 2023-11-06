import BaseModel from './BaseModel';

export default interface Side extends BaseModel {
	side: string;
	team_name: string;
	team_id: number;
	game_id: number;
}
