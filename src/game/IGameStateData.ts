import { CraftsmenPosition } from './CraftsmenPosition';
import { HashedType, PositionData } from './HashedType';
import IScores from './IScores';
import { Position } from './Position';
import { EWallSide, WallPosition } from './WallPosition';

/**
 * @description Game state data
 */
export default interface IGameStateData {
	/**
	 * @description Castle coefficient
	 */
	castle_coeff: number;

	/**
	 * @description Wall coefficient
	 */
	wall_coeff: number;

	/**
	 * @description Territory coefficient
	 */
	territory_coeff: number;

	/**
	 * @description Width of field
	 */
	width: number;

	/**
	 * @description Height of field
	 */
	height: number;

	/**
	 * @description Position of ponds
	 */
	ponds: Position[];

	/**
	 * @description Position of castles
	 */
	castles: Position[];

	/**
	 * @description Position of craftsmen
	 */
	craftsmen: CraftsmenPosition[];

	/**
	 * @description Position of walls
	 */
	walls: WallPosition[];

	/**
	 * @description Turn of lastest action has been added
	 */
	lastTurn: number;

	/**
	 * @description Hashed position of craftsmens
	 */
	hashedCraftmens: HashedType<CraftsmenPosition>;

	/**
	 * @description Hashed position of walls
	 */
	hashedWalls: HashedType<WallPosition>;

	/**
	 * @description Hashed position of ponds
	 */
	hashedPonds: HashedType<Position>;

	/**
	 * @description Hashed position of castles
	 */
	hashedCastles: HashedType<Position>;

	/**
	 * @description Hashed position of going to
	 */
	goingTo: HashedType<Position>;

	/**
	 * @description Hashed side of walls
	 */
	hashedSide: HashedType<EWallSide>;

	/**
	 * @description List of sides
	 */
	sides: PositionData<EWallSide>[];

	/**
	 * @description Scores
	 */
	scores: {
		[side: string]: IScores;
	};

	/**
	 * @description History of scores
	 */
	scoresHistory: {
		[side: string]: IScores[];
	};
}
