import BaseModel from './BaseModel';
import Position, { CraftsmenPosition } from './Position';

export default interface Field extends BaseModel {
	name: string;
	castle_coeff: number;
	wall_coeff: number;
	territory_coeff: number;
	width: number;
	height: number;
	ponds: Position[];
	castles: Position[];
	craftsmen: CraftsmenPosition[];
	match_id: number;
}
