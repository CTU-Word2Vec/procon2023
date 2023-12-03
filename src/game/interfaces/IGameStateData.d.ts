import { ICraftsmenPosition, IPosition, IPositionData, IWallPosition } from '.';
import { EWallSide } from '../classes/WallPosition';
import IScores from './IScores';

/**
 * @description Game state data
 */
export default interface IGameStateData {
	/**
	 * @description Id of the game
	 */
	id: number;

	/**
	 * @description Id of the match
	 */
	match_id: number;

	/**
	 * @description Name of the game
	 */
	name: string;

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
	ponds: IPosition[];

	/**
	 * @description Position of castles
	 */
	castles: IPosition[];

	/**
	 * @description Position of craftsmen
	 */
	craftsmen: ICraftsmenPosition[];

	/**
	 * @description Position of walls
	 */
	walls: IWallPosition[];

	/**
	 * @description Turn of lastest action has been added
	 */
	lastTurn: number;

	/**
	 * @description List of sides
	 */
	sides: IPositionData<EWallSide>[];

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

	/**
	 * @description Những điểm có thể xây dựng
	 */
	buildPositions: IPositionData<number>[];

	/**
	 * @description Những điểm có thể phá hủy
	 */
	destroyPositions: IPositionData<boolean>[];

	/**
	 * @description Những điểm cần đi đến
	 */
	targetPositions: IPosition[];
}
