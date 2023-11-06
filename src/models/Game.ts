import BaseModel from './BaseModel';
import Field from './Field';
import Side from './Side';

export default interface Game extends BaseModel {
	name: string;
	num_of_turns: number;
	time_per_turn: number;
	start_time: string;
	field_id: number;
	sides: Side[];
	field: Field;
}
