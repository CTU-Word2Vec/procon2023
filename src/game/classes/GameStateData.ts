import { EWallSide } from '../enums/EWallSide';
import IGameStateData from '../interfaces/IGameStateData';
import { default as IPositionData, default as PositionData } from '../interfaces/IPositionData';
import IScores from '../interfaces/IScores';
import CraftsmenPosition from './CraftsmenPosition';
import HashedType from './HashedType';
import Position from './Position';
import WallPosition from './WallPosition';

/**
 * @description Game state data
 * @implements IGameStateData
 */
export default class GameStateData implements IGameStateData {
	public buildPositions: PositionData<boolean>[];
	public destroyPositions: PositionData<boolean>[];
	public targetPositions: Position[];
	public scorePositions: IPositionData<number>[];

	/**
	 * @description Game state data constructor
	 * @param id - The game id
	 * @param match_id - The match id
	 * @param name - The game name
	 * @param castle_coeff - The castle coefficient
	 * @param wall_coeff - The wall coefficient
	 * @param territory_coeff - The territory coefficient
	 * @param width - The field width
	 * @param height - The field height
	 * @param ponds - The position of ponds
	 * @param castles - The position of castles
	 * @param craftsmen - The position of craftsmens
	 * @param walls - The position of walls
	 * @param lastTurn - Last turn
	 * @param hashedCraftmens - Hashed position of craftsmens
	 * @param hashedWalls - Hashed position of walls
	 * @param hashedPonds - Hashed position of ponds
	 * @param hashedCastles - Hashed position of castles
	 * @param goingTo - Hashed position of going to
	 * @param hashedSide - Hashed position of side
	 * @param sides - Sides
	 * @param scores - Scores
	 * @param scoresHistory - Scores history
	 */
	constructor(
		public id: number,
		public match_id: number,
		public name: string,

		public castle_coeff: number,
		public wall_coeff: number,
		public territory_coeff: number,
		public width: number,
		public height: number,
		public ponds: Position[],
		public castles: Position[],
		public craftsmen: CraftsmenPosition[],
		public walls: WallPosition[],

		public lastTurn = 0,

		protected hashedCraftmens: HashedType<CraftsmenPosition>,
		protected hashedWalls: HashedType<WallPosition>,
		protected hashedPonds: HashedType<Position>,
		protected hashedCastles: HashedType<Position>,

		protected goingTo: HashedType<Position>,
		protected hashedSide: HashedType<EWallSide>,

		public sides: IPositionData<EWallSide>[],

		public scores: {
			[side: string]: IScores;
		},

		public scoresHistory: {
			[side: string]: IScores[];
		},
	) {
		this.buildPositions = [];
		this.destroyPositions = [];
		this.targetPositions = [];
		this.scorePositions = [];

		// Call the first hashing
		this.firstHashing();
	}

	/**
	 * @description First hashing
	 */
	private firstHashing(): void {
		for (const craftsman of this.craftsmen) {
			this.hashedCraftmens.write(craftsman, craftsman);
		}

		for (const pond of this.ponds) {
			this.hashedPonds.write(pond, pond);
		}

		for (const castle of this.castles) {
			this.hashedCastles.write(castle, castle);
		}
	}
}
