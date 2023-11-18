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

	private craftsmanDoAction(craftsman: CraftsmenPosition, action: Action) {
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

	private destroyWall(pos: Position) {
		this.hashedWalls.remove(pos);
		this.walls = this.walls.filter((e) => !e.equals(pos));
	}

	private canDestroy(pos: Position) {
		return this.hashedWalls.exist(pos);
	}

	private moveCraftsmen(craftsmen: CraftsmenPosition, pos: Position) {
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

	private buildWall(pos: Position, side: EWallSide) {
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

	public getNextActions(side: EWallSide): ActionDto[] {
		this.goingTo = new HashedType<Position>();
		const actions: ActionDto[] = [];

		for (const craftmen of this.craftsmen) {
			if (craftmen.side !== side) continue;

			const action = this.getNextAction(craftmen);

			if (action) {
				actions.push(action);
				continue;
			}

			actions.push(this.getBuildAction(craftmen));
		}

		this.goingTo = new HashedType<Position>();
		return actions;
	}

	private getNextAction(craftmen: CraftsmenPosition): ActionDto | null {
		const destroyAction = this.getDestroyAction(craftmen);

		if (destroyAction) {
			return destroyAction;
		}

		const pos = this.getNextPosition(craftmen);

		if (!pos) {
			return {
				action: 'STAY',
				craftsman_id: craftmen.id,
			};
		}

		if (!pos.equals(craftmen)) {
			const nextActions = craftmen.getActionsToGoToPosition(pos);

			for (const action of nextActions) {
				if (this.canCrafsmenDoAction(craftmen, action)) {
					const nextPos = craftmen.getPositionByActionParam(action.action_param!);

					this.goingTo.write(nextPos, nextPos);
					return action;
				}
			}
		}

		return null;
	}

	private canCrafsmenDoAction(craftmen: CraftsmenPosition, action: ActionDto) {
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

	private getNextPosition(craftmen: CraftsmenPosition): Position | null {
		const closestCastle = this.findClosestCastle(craftmen);

		if (closestCastle) {
			return closestCastle;
		}

		const position = new Position(craftmen.x, craftmen.y);

		const positions: Position[] = [];
		positions.push(position);

		while (positions.length) {
			const pos = positions.shift() as Position;

			if (!pos.isValid(this.width, this.height)) continue;
			if (this.goingTo.exist(pos)) continue;

			const canBuild = !!this.getBuildActionFromPosition(pos);

			if (canBuild) {
				return pos;
			}

			positions.push(...pos.upperLeftUpperRightLowerRightLowerLeft(), ...pos.topRightBottomLeft());
		}

		return null;
	}

	private getBuildAction(craftmen: CraftsmenPosition): ActionDto {
		const action = this.getBuildActionFromPosition(craftmen);

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

	private getBuildActionFromPosition(pos: Position): EBuildDestryParam | null {
		const [above, right, below, left] = pos.topRightBottomLeft();

		if (this.canBuildWall(above)) {
			return 'ABOVE';
		}

		if (this.canBuildWall(below)) {
			return 'BELOW';
		}

		if (this.canBuildWall(left)) {
			return 'LEFT';
		}

		if (this.canBuildWall(right)) {
			return 'RIGHT';
		}

		return null;
	}

	private findClosestCastle(craftsmen: CraftsmenPosition) {
		let min = Infinity;
		let closestCastle: Position | null = null;

		for (const castle of this.castles) {
			if (this.goingTo.exist(castle)) continue;
			if (this.hashedCraftmen.exist(castle) && !craftsmen.equals(castle)) continue;

			const distance = craftsmen.distance(castle);

			if (this.isBuilded(new CraftsmenPosition(castle.x, castle.y, craftsmen.id, craftsmen.side))) continue;

			if (distance < min) {
				min = distance;
				closestCastle = castle;
			}
		}

		return closestCastle;
	}

	private isBuilded(craftmen: CraftsmenPosition) {
		const positions = craftmen.topRightBottomLeft();

		return positions.every((pos) => this.hashedWalls.read(pos)?.side === craftmen.side);
	}

	private getDestroyAction(craftsmen: CraftsmenPosition): ActionDto | null {
		const [above, right, below, left] = craftsmen.topRightBottomLeft();

		if (this.hashedWalls.exist(above) && this.hashedWalls.read(above)?.side !== craftsmen.side) {
			return {
				action: 'DESTROY',
				action_param: 'ABOVE',
				craftsman_id: craftsmen.id,
			};
		}

		if (this.hashedWalls.exist(right) && this.hashedWalls.read(right)?.side !== craftsmen.side) {
			return {
				action: 'DESTROY',
				action_param: 'RIGHT',
				craftsman_id: craftsmen.id,
			};
		}

		if (this.hashedWalls.exist(below) && this.hashedWalls.read(below)?.side !== craftsmen.side) {
			return {
				action: 'DESTROY',
				action_param: 'BELOW',
				craftsman_id: craftsmen.id,
			};
		}

		if (this.hashedWalls.exist(left) && this.hashedWalls.read(left)?.side !== craftsmen.side) {
			return {
				action: 'DESTROY',
				action_param: 'LEFT',
				craftsman_id: craftsmen.id,
			};
		}

		return null;
	}
}

export default GameManager;
