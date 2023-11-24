import Field from '@/models/Field';
import CraftsmenPosition from '../classes/CraftsmenPosition';
import GameStateData from '../classes/GameStateData';
import HashedType from '../classes/HashedType';
import Position from '../classes/Position';
import WallPosition from '../classes/WallPosition';
import { EWallSide } from '../enums/EWallSide';
import IBaseGameManager from '../interfaces/IBaseGameManager';
import IScores from '../interfaces/IScores';

/**
 * @description Base game manager
 * @extends GameStateData
 * @implements IBaseGameManager
 */
export default class BaseGameManager extends GameStateData implements IBaseGameManager {
	/**
	 * @description Game manager constructor
	 * @param field - Field of game
	 * @param numberOfTurns - Number of turns
	 * @constructor
	 */
	constructor(field: Field, numberOfTurns: number = 100) {
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

			scoresHistory[side] = Array.from({ length: numberOfTurns }, () => ({
				castles: 0,
				territories: 0,
				total: 0,
				walls: 0,
			}));
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
