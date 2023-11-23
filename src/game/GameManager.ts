import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import { ActionDto } from '@/services/player.service';
import sortActions from '@/utils/sortActions';
import { CraftsmenPosition } from './CraftsmenPosition';
import { HashedType, PositionData } from './HashedType';
import IGameStateData from './IGameStateData';
import IScores from './IScores';
import { Position } from './Position';
import { EWallSide, WallPosition } from './WallPosition';

/**
 * @description Game manager
 * @implements GameStateData
 */
export default class GameManager implements IGameStateData {
	public castle_coeff: number;
	public wall_coeff: number;
	public territory_coeff: number;
	public width: number;
	public height: number;
	public ponds: Position[];
	public castles: Position[];
	public craftsmen: CraftsmenPosition[];
	public walls: WallPosition[];

	public lastTurn = 0;
	public hashedCraftmens: HashedType<CraftsmenPosition>;
	public hashedWalls: HashedType<WallPosition>;
	public hashedPonds: HashedType<Position>;
	public hashedCastles: HashedType<Position>;

	public goingTo: HashedType<Position>;
	public hashedSide: HashedType<EWallSide>;
	public sides: PositionData<EWallSide>[];

	public scores: {
		[side: string]: IScores;
	};

	public scoresHistory: {
		[side: string]: IScores[];
	};

	/**
	 * @description Game manager
	 * @param field - Field of game
	 * @constructor
	 */
	constructor(field: Field) {
		this.castle_coeff = field.castle_coeff;
		this.wall_coeff = field.wall_coeff;
		this.territory_coeff = field.territory_coeff;
		this.width = field.width;
		this.height = field.height;
		this.ponds = field.ponds.map((e) => new Position(e.x, e.y));
		this.castles = field.castles.map((e) => new Position(e.x, e.y));
		this.craftsmen = field.craftsmen.map((e) => new CraftsmenPosition(e.x, e.y, e.id, e.side));

		this.walls = [];

		this.hashedCraftmens = new HashedType<CraftsmenPosition>();
		this.hashedWalls = new HashedType<WallPosition>();
		this.hashedPonds = new HashedType<Position>();
		this.hashedCastles = new HashedType<Position>();

		this.goingTo = new HashedType<Position>();
		this.hashedSide = new HashedType<EWallSide>();
		this.sides = [];

		this.scores = {};
		this.scoresHistory = {};

		for (const side of ['A', 'B']) {
			this.scores[side] = {
				castles: 0,
				territories: 0,
				total: 0,
				walls: 0,
			};

			this.scoresHistory[side] = [this.scores[side]];
		}

		this.firstHashing();
	}

	/**
	 *
	 * @returns Game state data
	 */
	public getData(): IGameStateData {
		return { ...this };
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

	/**
	 * @description Get position of craftsmen
	 * @param actions - List of actions
	 */
	public addActions(actions: GameAction[]): void {
		// If there is no action, do nothing
		if (!actions.length) return;

		// Timestamp of start time
		const startTime = Date.now();

		for (let i = 0; i < actions.length; i++) {
			if (actions[i].turn <= this.lastTurn) {
				// If the turn is less than or equal to the last turn, then do nothing
				continue;
			}

			if (actions[i].turn === actions[i + 1]?.turn) {
				// If current turn is equal to next turn, then do nothing
				actions[i].disabled = true;
				continue;
			}

			actions[i].actions = sortActions(actions[i].actions);

			// Find craftsmen by id and do action
			for (const action of actions[i].actions) {
				for (const craftsman of this.craftsmen) {
					if (craftsman.id === action.craftsman_id) this.craftsmanDoAction(craftsman, action);
				}
			}

			// Update last turn
			this.lastTurn = actions[i].turn;

			// Update scores after add action
			this.updateScores();
		}

		// Timestamp of end time
		const endTime = Date.now();

		// Log time to add actions
		console.log(`Time to add actions: ${endTime - startTime}ms`);
	}

	/**
	 * @description Get position of craftsmen
	 * @param craftsman - Craftsman
	 * @param action - Action
	 * @returns Whether the craftsman can do action
	 */
	protected craftsmanDoAction(craftsman: CraftsmenPosition, action: Action): void {
		if (!this.canCrafsmenDoAction(craftsman, action)) {
			// If the craftsman cannot do action, then do nothing and update action to "STAY"
			action.action = 'STAY';
			return;
		}

		switch (action.action) {
			case 'MOVE':
				this.craftsmenMove(craftsman, craftsman.getPositionByActionParam(action.action_param!));
				break;

			case 'BUILD':
				this.buildWall(craftsman.getPositionByActionParam(action.action_param!), craftsman.side);
				break;

			case 'DESTROY':
				this.destroyWall(craftsman.getPositionByActionParam(action.action_param!));
				break;

			case 'STAY':
				break;

			default:
				throw new Error(`Invalid action: (${action.action})`);
		}
	}

	/**
	 * @description Destroy wall
	 * @param pos - Position
	 * @returns Whether the position is a pond
	 */
	protected destroyWall(pos: Position): void {
		// If the position is not a wall, then do nothing
		if (!this.hashedWalls.exist(pos)) return;

		// Start removing wall
		this.hashedWalls.remove(pos);
		this.walls = this.walls.filter((e) => !e.equals(pos));

		// Update side after removing wall
		this.updateSideFromPosition(pos);
	}

	/**
	 * @description Move craftsmen to position
	 * @param craftsmen - Craftsman
	 * @param pos - Position
	 */
	protected craftsmenMove(craftsmen: CraftsmenPosition, pos: Position): void {
		// Remove old position
		this.hashedCraftmens.remove(craftsmen);

		// Update side after removing old position
		craftsmen.x = pos.x;
		craftsmen.y = pos.y;

		// Add new position
		this.hashedCraftmens.write(craftsmen, craftsmen);
	}

	/**
	 * @description Build wall at position
	 * @param pos - Position
	 * @param side - Side
	 */
	protected buildWall(pos: Position, side: EWallSide): void {
		// Create new wall
		const wall = new WallPosition(pos.x, pos.y, side);
		// Add new wall to list of walls
		this.walls.push(wall);
		// Hash new wall to hashed walls
		this.hashedWalls.write(wall, wall);

		// Get nearby positions of new wall and update side
		const positions = pos.topRightBottomLeft();

		const visited = new HashedType<boolean>();
		const filled = new HashedType<boolean>();

		for (const position of positions) {
			this.updateSideFromPosition(position, side, visited, filled);
		}

		this.hashedSide.remove(pos);
	}

	/**
	 * @description Check if the position is a pond
	 * @param pos - Position
	 * @returns Whether the position is a pond
	 */
	protected canCraftsmenDestroy(pos: Position): boolean {
		// Craftsmen can destroy wall if the position is a wall
		return this.hashedWalls.exist(pos);
	}

	/**
	 * @description Check if the craftsmen can move to position
	 * @param craftsmen - Craftsman
	 * @param pos - Position
	 * @returns Whether the craftsmen can move to position
	 */
	protected canCraftsmenMove(craftsmen: CraftsmenPosition, pos: Position): boolean {
		// Craftsmen can move if the position is valid and not a wall, a pond or a craftsmen
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedWalls.exist(pos) && craftsmen.side !== this.hashedWalls.read(pos)!.side) return false;

		return true;
	}

	/**
	 * @description Check if the craftsmen can build wall at position
	 * @param pos - Position
	 * @returns Whether the craftsmen can build wall at position
	 */
	protected canCraftsmenBuildWall(pos: Position): boolean {
		// Craftsmen can build wall if the position is valid and not a wall, a pond or a craftsmen
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;

		return true;
	}

	/**
	 * @description Check if the craftsmen can do action
	 * @param craftmen - Craftsmen
	 * @param action - Action
	 * @returns Whether the craftsmen can do action
	 */
	protected canCrafsmenDoAction(craftmen: CraftsmenPosition, action: ActionDto): boolean {
		// Get position to do action
		const nextPos = craftmen.getPositionByActionParam(action.action_param || 'ABOVE');

		switch (action.action) {
			case 'STAY':
				return true;
			case 'MOVE': {
				return this.canCraftsmenMove(craftmen, nextPos);
			}
			case 'BUILD': {
				return this.canCraftsmenBuildWall(nextPos);
			}
			case 'DESTROY': {
				return this.canCraftsmenDestroy(nextPos);
			}
		}
	}

	/**
	 * @description Get side of position
	 * @param pos - Position
	 * @param currentSide - Current side
	 * @param visited - Visited positions
	 * @returns Side of position
	 */
	protected sideOf(
		pos: Position,
		currentSide: EWallSide | null = null,
		visited: HashedType<boolean> = new HashedType<boolean>(),
	): EWallSide | null {
		// If the position is not valid, then return null
		if (!pos.isValid(this.width, this.height)) return null;
		if (this.hashedWalls.exist(pos)) {
			// If the position is a wall and the side of the wall is not equal to current side, then return null
			if (currentSide && currentSide === this.hashedWalls.read(pos)!.side) return currentSide;
		}

		// Mark the position as visited
		visited.write(pos, true);

		// Get nearby positions
		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			// If the position is visited, then do nothing
			if (visited.exist(position)) continue;

			// Get side of position
			const newSide = this.sideOf(position, currentSide, visited);

			// If the side of position is null, then return null
			if (!newSide) return null;

			// If the current side is null, then set current side to new side
			if (!currentSide) currentSide = newSide;
			// If the current side is not equal to new side, then return null
			else if (currentSide !== newSide) return null;
		}

		// Return final side
		return currentSide;
	}

	/**
	 * @description Fill side of position and nearby positions
	 * @param pos - Position
	 * @param side - Side to fill
	 * @param filled - Filled positions
	 */
	protected fillSide(
		pos: Position,
		side: EWallSide | null,
		filled: HashedType<boolean> = new HashedType<boolean>(),
	): void {
		// If the position is not valid, then do nothing
		if (!pos.isValid(this.width, this.height)) return;
		// If the position is filled, then do nothing
		if (filled.exist(pos)) return;
		// If the position is a wall, then do nothing
		if (this.hashedWalls.exist(pos)) return;

		// Mark the position as filled
		filled.write(pos, true);

		// If the side is not null, then hash the side to hashed side
		if (side) this.hashedSide.write(pos, side);
		// Else remove the position from hashed side
		else this.hashedSide.remove(pos);

		// Get nearby positions and fill side of them
		const positions = pos.topRightBottomLeft();
		for (const pos of positions) {
			this.fillSide(pos, side, filled);
		}
	}

	/**
	 * @description Update side from position
	 * @param pos - Position
	 * @param initSide - Initial side
	 * @param visited - Visited positions
	 * @param filled - Filled positions
	 */
	protected updateSideFromPosition(
		pos: Position,
		initSide: EWallSide | null = null,
		visited: HashedType<boolean> = new HashedType<boolean>(),
		filled: HashedType<boolean> = new HashedType<boolean>(),
	): void {
		// Get side of position
		const updateSide = this.sideOf(pos, initSide, visited);

		// Fill side of position and nearby positions
		this.fillSide(pos, updateSide, filled);

		// Update sides from hashed side
		this.sides = this.hashedSide.toList();
	}

	/**
	 * @description Get action to go to position
	 * @param craftmen - Craftsmen
	 * @param pos - Position
	 * @returns Action to go to position or null
	 */
	protected getActionToGoToPosition(craftmen: CraftsmenPosition, pos: Position): ActionDto | null {
		// Get next actions to go to position
		const nextActions = craftmen.getNextActionsToGoToPosition(pos);

		// Check if the craftsmen can do action
		for (const action of nextActions) {
			if (this.canCrafsmenDoAction(craftmen, action)) {
				return action;
			}
		}

		// If the craftsmen cannot do action, then return null
		return null;
	}

	/**
	 * @description Update scores of teams
	 */
	protected updateScores() {
		const sides = Object.keys(this.scores) as EWallSide[];

		for (const side of sides) {
			// Calculate score of walls
			this.scores[side].walls = this.walls.reduce((prev, wall) => {
				if (wall.side !== side) return prev;
				return prev + this.wall_coeff;
			}, 0);

			// Calculate score of castles
			this.scores[side].castles = this.castles.reduce((prev, castle) => {
				if (this.hashedSide.read(castle) !== side) return prev;
				return prev + this.castle_coeff;
			}, 0);

			// Calculate score of territories
			this.scores[side].territories = this.sides.reduce((prev, currentSide) => {
				if (currentSide.data !== side) return prev;

				return prev + this.territory_coeff;
			}, 0);

			// Calculate total score
			this.scores[side].total =
				this.scores[side].castles + this.scores[side].territories + this.scores[side].walls;

			this.scoresHistory[side].push({ ...this.scores[side] });
		}
	}
}
