import { EBuildDestryParam } from '@/constants/action-params';
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
	}

	private craftsmanDoAction(craftsman: CraftsmenPosition, action: Action) {
		switch (action.action) {
			case 'MOVE':
				this.moveCraftsmen(craftsman, craftsman.getPositionByActionParam(action.action_param!), action);
				break;

			case 'BUILD':
				this.buildWall(craftsman.getPositionByActionParam(action.action_param!), craftsman.side, action);
				break;

			case 'DESTROY':
				this.destroy(craftsman.getPositionByActionParam(action.action_param!), action);
				break;

			case 'STAY':
				break;

			default:
				throw new Error(`Invalid action: (${action.action})`);
		}
	}

	private destroy(pos: Position, action: Action) {
		if (!this.canDestroy(pos)) {
			action.action = 'STAY';
			return;
		}

		this.hashedWalls.remove(pos);
	}

	private canDestroy(pos: Position) {
		return this.hashedWalls.exist(pos);
	}

	private moveCraftsmen(craftsmen: CraftsmenPosition, pos: Position, action: Action) {
		if (!this.canCraftsmenMove(craftsmen, pos)) {
			action.action = 'STAY';
			return;
		}

		this.hashedCraftmen.remove(craftsmen);

		craftsmen.x = pos.x;
		craftsmen.y = pos.y;

		this.hashedCraftmen.write(craftsmen, craftsmen);
	}

	private canCraftsmenMove(craftsmen: CraftsmenPosition, pos: Position) {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmen.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedWalls.exist(pos) && craftsmen.side !== this.hashedWalls.read(pos)!.side) return false;

		return true;
	}

	private buildWall(pos: Position, side: EWallSide, action: Action) {
		if (!this.canBuildWall(pos)) {
			action.action = 'STAY';
			return;
		}

		const wall = new WallPosition(pos.x, pos.y, side);
		this.walls.push(wall);
		this.hashedWalls.write(wall, wall);
	}

	private canBuildWall(pos: Position) {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmen.exist(pos)) return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;

		return true;
	}

	public caroGetActions(side: EWallSide): ActionDto[] {
		const actions: ActionDto[] = [];

		for (const craftmen of this.craftsmen) {
			if (craftmen.side !== side) continue;

			const pos = this.caroGetNextPosition(craftmen);

			if (!pos) {
				actions.push({
					action: 'STAY',
					craftsman_id: craftmen.id,
				});
				continue;
			}

			if (pos.x !== craftmen.x || pos.y !== craftmen.y) {
				actions.push(craftmen.getActionToGoToPosition(pos));
				continue;
			}

			actions.push(this.caroGetBuildAction(craftmen));
		}

		return actions;
	}

	private caroGetNextPosition(craftmen: CraftsmenPosition): Position | null {
		const position = new Position(craftmen.x, craftmen.y);

		const positions: Position[] = [];
		positions.push(position);

		while (positions.length) {
			const pos = positions.shift() as Position;

			if (!pos.isValid(this.width, this.height)) continue;

			const canBuild = !!this.caroGetBuildActionFromPosition(pos);

			if (canBuild) {
				return pos;
			}

			positions.push(...pos.topRightBottomLeft());
		}

		return null;
	}

	private caroGetBuildAction(craftmen: CraftsmenPosition): ActionDto {
		const action = this.caroGetBuildActionFromPosition(craftmen);

		if (!action) {
			return {
				craftsman_id: craftmen.id,
				action: 'STAY',
			};
		}

		return {
			craftsman_id: craftmen.id,
			action: 'BUILD',
			action_param: action,
		};
	}

	private caroGetBuildActionFromPosition(pos: Position): EBuildDestryParam | null {
		const [above, right, below, left] = pos.topRightBottomLeft();

		if (this.canBuildWall(above) && above.isValid(this.width, this.height)) {
			return 'ABOVE';
		}

		if (this.canBuildWall(below) && below.isValid(this.width, this.height)) {
			return 'BELOW';
		}

		if (this.canBuildWall(left) && left.isValid(this.width, this.height)) {
			return 'LEFT';
		}

		if (this.canBuildWall(right) && right.isValid(this.width, this.height)) {
			return 'RIGHT';
		}

		return null;
	}
}

export default GameManager;
