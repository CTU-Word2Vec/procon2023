import Field from '@/models/Field';
import CraftsmenPosition from './CraftsmenPosition';
import { EWallSide } from './EWallSide';
import GameStateData from './GameStateData';
import { HashedType } from './HashedType';
import IBaseGameManager from './IBaseGameManager';
import IScores from './IScores';
import Position from './Position';
import WallPosition from './WallPosition';

/**
 * @description Base game manager
 * @extends GameStateData
 * @implements {IBaseGameManager}
 */
export default class BaseGameManager extends GameStateData implements IBaseGameManager {
	/**
	 * @description Game manager constructor
	 * @param field - Field of game
	 * @constructor
	 */
	constructor(field: Field) {
		const scores: {
			[x: string]: IScores;
		} = {};

		const scoresHistory: {
			[x: string]: IScores[];
		} = {};

		for (const side of ['A', 'B']) {
			scores[side] = {
				castles: 0,
				territories: 0,
				total: 0,
				walls: 0,
			};

			scoresHistory[side] = [scores[side]];
		}

		super(
			field.id,
			field.match_id,
			field.name,
			field.castle_coeff,
			field.wall_coeff,
			field.territory_coeff,
			field.width,
			field.height,
			field.ponds.map((e) => new Position(e.x, e.y)),
			field.castles.map((e) => new Position(e.x, e.y)),
			field.craftsmen.map((e) => new CraftsmenPosition(e.x, e.y, e.id, e.side)),
			[],
			0,
			new HashedType<CraftsmenPosition>(),
			new HashedType<WallPosition>(),
			new HashedType<Position>(),
			new HashedType<Position>(),
			new HashedType<Position>(),
			new HashedType<EWallSide>(),
			[],
			scores,
			scoresHistory,
		);
	}
}