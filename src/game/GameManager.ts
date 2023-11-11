import { EBuildDestryParam } from '@/constants/action-params';
import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import { ActionDto } from '@/services/player.service';
import { CraftsmenPosition } from './CraftsmenPosition';
import { Position } from './Position';

export interface GameStateData {
	castle_coeff: number;
	wall_coeff: number;
	territory_coeff: number;
	width: number;
	height: number;
	ponds: Position[];
	castles: Position[];
	craftsmen: CraftsmenPosition[];
	walls: Position[];

	hashedCraftmen: { [x: number]: { [y: number]: CraftsmenPosition | null } | null };
	hashedWalls: { [x: number]: { [y: number]: 'A' | 'B' | null } | null };
	hashedPonds: { [x: number]: { [y: number]: Position | null } | null };
	hashedCastles: { [x: number]: { [y: number]: Position | null } | null };
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
	public walls: Position[];

	private lastTurn = 0;

	public hashedCraftmen: { [x: number]: { [y: number]: CraftsmenPosition | null } | null };
	public hashedWalls: { [x: number]: { [y: number]: 'A' | 'B' | null } | null };
	public hashedPonds: { [x: number]: { [y: number]: Position | null } | null };
	public hashedCastles: { [x: number]: { [y: number]: Position | null } | null };

	constructor(field: Field) {
		field = JSON.parse(JSON.stringify(field)) as Field;

		this.castle_coeff = field.castle_coeff;
		this.wall_coeff = field.wall_coeff;
		this.territory_coeff = field.territory_coeff;
		this.width = field.width;
		this.height = field.height;
		this.ponds = field.ponds.map((e) => new Position(e.x, e.y));
		this.castles = field.castles.map((e) => new Position(e.x, e.y));
		this.craftsmen = field.craftsmen.map((e) => new CraftsmenPosition(e.x, e.y, e.id, e.side));

		this.walls = [];
		this.hashedCraftmen = {};
		this.hashedWalls = {};
		this.hashedPonds = {};
		this.hashedCastles = {};

		this.firstBuild();
	}

	public getData() {
		return { ...this };
	}

	private firstBuild() {
		for (const craftsman of this.craftsmen) {
			this.addHashCraftsmen(craftsman);
		}

		for (const pond of this.ponds) {
			if (!this.hashedPonds[pond.x]) {
				this.hashedPonds[pond.x] = {};
			}
			this.hashedPonds[pond.x]![pond.y] = pond;
		}

		for (const castle of this.castles) {
			if (!this.hashedCastles[castle.x]) {
				this.hashedCastles[castle.x] = {};
			}
			this.hashedCastles[castle.x]![castle.y] = castle;
		}
	}

	public addActions(actions: GameAction[]) {
		if (!actions.length) return;

		for (let i = 0; i < actions.length; i++) {
			if (actions[i].turn < this.lastTurn) {
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
				switch (action.action_param) {
					case 'DOWN':
						this.moveCraftsmen(craftsman, craftsman.left(), action);
						break;

					case 'UP':
						this.moveCraftsmen(craftsman, craftsman.up(), action);
						break;

					case 'LEFT':
						this.moveCraftsmen(craftsman, craftsman.left(), action);
						break;

					case 'RIGHT':
						this.moveCraftsmen(craftsman, craftsman.right(), action);
						break;

					case 'LOWER_LEFT':
						this.moveCraftsmen(craftsman, craftsman.lowerLeft(), action);
						break;

					case 'LOWER_RIGHT':
						this.moveCraftsmen(craftsman, craftsman.lowerRight(), action);
						break;

					case 'UPPER_LEFT':
						this.moveCraftsmen(craftsman, craftsman.upperLeft(), action);
						break;

					case 'UPPER_RIGHT':
						this.moveCraftsmen(craftsman, craftsman.upperRight(), action);
						break;
				}
				break;

			case 'BUILD':
				switch (action.action_param) {
					case 'LEFT':
						this.buildWall(craftsman.left(), craftsman.side, action);
						break;

					case 'RIGHT':
						this.buildWall(craftsman.right(), craftsman.side, action);
						break;

					case 'ABOVE':
						this.buildWall(craftsman.above(), craftsman.side, action);
						break;

					case 'BELOW':
						this.buildWall(craftsman.below(), craftsman.side, action);
						break;
				}
				break;

			case 'DESTROY':
				switch (action.action_param) {
					case 'LEFT':
						this.destroy(craftsman.left(), action);
						break;

					case 'RIGHT':
						this.destroy(craftsman.right(), action);
						break;

					case 'ABOVE':
						this.destroy(craftsman.above(), action);
						break;

					case 'BELOW':
						this.destroy(craftsman.below(), action);
						break;
				}
				break;

			default:
				break;
		}
	}

	private destroy(pos: Position, action: Action) {
		if (!this.canDestroy(pos)) {
			action.action = 'STAY';
			return;
		}

		this.hashedWalls[pos.x]![pos.y] = null;
	}

	private canDestroy(pos: Position) {
		return !!this.hashedWalls[pos.x]?.[pos.y];
	}

	private moveCraftsmen(craftsmen: CraftsmenPosition, pos: Position, action: Action) {
		if (!this.canCraftsmenMove(pos, craftsmen)) {
			action.action = 'STAY';
			return;
		}

		this.removeHashedCraftmen(craftsmen);

		craftsmen.x = pos.x;
		craftsmen.y = pos.y;

		this.addHashCraftsmen(craftsmen);
	}

	private canCraftsmenMove(pos: Position, craftsmen: CraftsmenPosition) {
		if (pos.x < 0 || pos.y < 0) return false;
		if (pos.x >= this.width || pos.y >= this.height) return false;

		if (this.hashedCraftmen[pos.x]?.[pos.y]) return false;
		if (this.hashedPonds[pos.x]?.[pos.y]) return false;
		if (this.hashedCastles[pos.x]?.[pos.y]) return false;

		if (this.hashedWalls[pos.x]?.[pos.y] && craftsmen.side !== this.hashedWalls[pos.x]![pos.y]) return false;

		return true;
	}

	private addHashCraftsmen(craftsmen: CraftsmenPosition) {
		if (!this.hashedCraftmen[craftsmen.x]) {
			this.hashedCraftmen[craftsmen.x] = {};
		}

		this.hashedCraftmen[craftsmen.x]![craftsmen.y] = craftsmen;
	}

	private removeHashedCraftmen(craftsmen: CraftsmenPosition) {
		if (!this.hashedCraftmen[craftsmen.x]) return;

		this.hashedCraftmen[craftsmen.x]![craftsmen.y] = null;
	}

	private buildWall(pos: Position, side: 'A' | 'B', action: Action) {
		if (!this.canBuildWall(pos)) {
			action.action = 'STAY';
			return;
		}

		this.walls.push(pos);

		if (!this.hashedWalls[pos.x]) {
			this.hashedWalls[pos.x] = {};
		}

		this.hashedWalls[pos.x]![pos.y] = side;
	}

	private canBuildWall(pos: Position) {
		if (this.hashedCraftmen[pos.x]?.[pos.y]) return false;
		if (this.hashedWalls[pos.x]?.[pos.y]) return false;
		if (this.hashedPonds[pos.x]?.[pos.y]) return false;
		if (this.hashedCastles[pos.x]?.[pos.y]) return false;

		return true;
	}

	public caroGetActions(side: 'A' | 'B'): ActionDto[] {
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

			positions.push(pos.upperLeft());
			positions.push(pos.upperRight());
			positions.push(pos.lowerLeft());
			positions.push(pos.lowerRight());
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
		const above = pos.above();
		const below = pos.below();
		const left = pos.left();
		const right = pos.right();

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
