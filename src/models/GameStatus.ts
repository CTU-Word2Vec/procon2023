import BaseModel from './BaseModel';
import Position, { CraftsmenPosition } from './Position';

export default interface GameStatus extends BaseModel {
	turn: number;
	game_id: number;
	craftsmen: CraftsmenPosition;
	walls: Position;
}
