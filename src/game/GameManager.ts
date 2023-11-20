import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import { ActionDto } from '@/services/player.service';
import { CraftsmenPosition } from './CraftsmenPosition';
import { HashedType, PositionData } from './HashedType';
import { Position } from './Position';
import { EWallSide, WallPosition } from './WallPosition';

export type GameMode = 'Caro' | 'A*';
export const gameModes: GameMode[] = ['Caro', 'A*'];

export interface GameStateData {
	castle_coeff: number;
	wall_coeff: number;
	territory_coeff: number;
	width: number;
	height: number;
	ponds: Position[];
	castles: Position[];
	craftsmen: CraftsmenPosition[];
	walls: WallPosition[];

	lastTurn: number;

	hashedCraftmen: HashedType<CraftsmenPosition>;
	hashedWalls: HashedType<WallPosition>;
	hashedPonds: HashedType<Position>;
	hashedCastles: HashedType<Position>;

	goingTo: HashedType<Position>;
	hashedSide: HashedType<EWallSide>;
	sides: PositionData<EWallSide>[];
}

class GameManager implements GameStateData {
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
	public hashedCraftmen: HashedType<CraftsmenPosition>;
	public hashedWalls: HashedType<WallPosition>;
	public hashedPonds: HashedType<Position>;
	public hashedCastles: HashedType<Position>;

	public goingTo: HashedType<Position>;
	public hashedSide: HashedType<EWallSide>;
	public sides: PositionData<EWallSide>[];

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

		this.hashedCraftmen = new HashedType<CraftsmenPosition>();
		this.hashedWalls = new HashedType<WallPosition>();
		this.hashedPonds = new HashedType<Position>();
		this.hashedCastles = new HashedType<Position>();

		this.goingTo = new HashedType<Position>();
		this.hashedSide = new HashedType<EWallSide>();
		this.sides = [];

		this.firstBuild();
	}

	public getData() {
		return { ...this };
	}

	private firstBuild() {
		for (const craftsman of this.craftsmen) {
			this.hashedCraftmen.write(craftsman, craftsman);
		}

		for (const pond of this.ponds) {
			this.hashedPonds.write(pond, pond);
		}

		for (const castle of this.castles) {
			this.hashedCastles.write(castle, castle);
		}
	}

	public addActions(actions: GameAction[]) {
		if (!actions.length) return;

		const startTime = Date.now();

		for (let i = 0; i < actions.length; i++) {
			if (actions[i].turn <= this.lastTurn) {
				continue;
			}

			if (actions[i].turn === actions[i + 1]?.turn) {
				continue;
			}

			for (const action of actions[i].actions) {
				for (const craftsman of this.craftsmen) {
					if (craftsman.id === action.craftsman_id) this.craftsmanDoAction(craftsman, action);
				}
			}

			this.lastTurn = actions[i].turn;
		}

		const endTime = Date.now();

		console.log(`Time to add actions: ${endTime - startTime}ms`);
	}

	protected craftsmanDoAction(craftsman: CraftsmenPosition, action: Action) {
		if (!this.canCrafsmenDoAction(craftsman, action)) {
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

	protected destroyWall(pos: Position) {
		if (!this.hashedWalls.exist(pos)) return;
		this.hashedWalls.remove(pos);
		this.walls = this.walls.filter((e) => !e.equals(pos));

		this.updateSideFromPosition(pos);
	}

	protected craftsmenMove(craftsmen: CraftsmenPosition, pos: Position) {
		this.hashedCraftmen.remove(craftsmen);

		craftsmen.x = pos.x;
		craftsmen.y = pos.y;

		this.hashedCraftmen.write(craftsmen, craftsmen);
	}

	protected buildWall(pos: Position, side: EWallSide) {
		const wall = new WallPosition(pos.x, pos.y, side);
		this.walls.push(wall);
		this.hashedWalls.write(wall, wall);

		this.updateSideFromPosition(pos, wall.side);
	}

	protected canCraftsmenDestroy(pos: Position) {
		return this.hashedWalls.exist(pos);
	}

	protected canCraftsmenMove(craftsmen: CraftsmenPosition, pos: Position) {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmen.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedWalls.exist(pos) && craftsmen.side !== this.hashedWalls.read(pos)!.side) return false;

		return true;
	}

	protected canCraftsmenBuildWall(pos: Position) {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmen.exist(pos)) return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;

		return true;
	}

	protected canCrafsmenDoAction(craftmen: CraftsmenPosition, action: ActionDto) {
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

	protected sideOf(
		pos: Position,
		visited: HashedType<Position> = new HashedType<Position>(),
		currentSide: EWallSide | null = null,
	): EWallSide | null {
		if (!pos.isValid(this.width, this.height)) return null;

		this.hashedSide.remove(pos);

		if (this.hashedWalls.exist(pos)) {
			if (currentSide && currentSide !== this.hashedWalls.read(pos)!.side) return null;
			return currentSide;
		}

		visited.write(pos, pos);

		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			if (visited.exist(position)) continue;

			const newSide = this.sideOf(position, visited, currentSide);

			if (!newSide) return null;

			if (!currentSide) currentSide = newSide;
			else if (currentSide !== newSide) return null;
		}

		return currentSide;
	}

	protected fillSide(pos: Position, side: EWallSide | null) {
		if (!pos.isValid(this.width, this.height)) return;
		if (this.hashedWalls.exist(pos)) return;

		if (side) {
			this.hashedSide.write(pos, side);
		} else {
			this.hashedSide.remove(pos);
		}
	}

	protected updateSideFromPosition(pos: Position, initSide: EWallSide | null = null) {
		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			const upateSide = this.sideOf(position, new HashedType<Position>(), initSide);
			this.fillSide(position, upateSide);
		}

		const updateSide = this.sideOf(pos, new HashedType<Position>(), initSide);
		this.fillSide(pos, updateSide);

		this.sides = this.hashedSide.toList();
	}
}

export default GameManager;
