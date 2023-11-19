import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import { ActionDto } from '@/services/player.service';
import { CraftsmenPosition } from './CraftsmenPosition';
import { HashedType } from './HashedType';
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
				this.moveCraftsmen(craftsman, craftsman.getPositionByActionParam(action.action_param!));
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
		this.hashedWalls.remove(pos);
		this.walls = this.walls.filter((e) => !e.equals(pos));
	}

	protected canDestroy(pos: Position) {
		return this.hashedWalls.exist(pos);
	}

	protected moveCraftsmen(craftsmen: CraftsmenPosition, pos: Position) {
		this.hashedCraftmen.remove(craftsmen);

		craftsmen.x = pos.x;
		craftsmen.y = pos.y;

		this.hashedCraftmen.write(craftsmen, craftsmen);
	}

	protected canCraftsmenMove(craftsmen: CraftsmenPosition, pos: Position) {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmen.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedWalls.exist(pos) && craftsmen.side !== this.hashedWalls.read(pos)!.side) return false;

		return true;
	}

	protected buildWall(pos: Position, side: EWallSide) {
		const wall = new WallPosition(pos.x, pos.y, side);
		this.walls.push(wall);
		this.hashedWalls.write(wall, wall);
	}

	protected canBuildWall(pos: Position) {
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
				return this.canBuildWall(nextPos);
			}
			case 'DESTROY': {
				return this.canDestroy(nextPos);
			}
		}
	}
}

export default GameManager;
