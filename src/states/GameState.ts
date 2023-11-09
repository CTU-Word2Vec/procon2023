import { EActionParam } from '@/constants/action-params';
import Action from '@/models/Action';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import Position, { CraftsmenPosition } from '@/models/Position';

export interface GameStateData extends Field {
	hashedCraftmen: { [x: number]: { [y: number]: CraftsmenPosition | null } | null };
	hashedWalls: { [x: number]: { [y: number]: 'A' | 'B' | null } | null };
	hashedPonds: { [x: number]: { [y: number]: Position | null } | null };
	hashedCastles: { [x: number]: { [y: number]: Position | null } | null };
}

const revertActionParam = {
	UP: 'DOWN',
	DOWN: 'UP',
	LEFT: 'RIGHT',
	RIGHT: 'LEFT',
	ABOVE: 'BELOW',
	UPPER_LEFT: 'LOWER_RIGHT',
	LOWER_RIGHT: 'UPPER_LEFT',
	UPPER_RIGHT: 'LOWER_LEFT',
	LOWER_LEFT: 'UPPER_RIGHT',
};

class GameState implements GameStateData {
	public name: string;
	public castle_coeff: number;
	public wall_coeff: number;
	public territory_coeff: number;
	public width: number;
	public height: number;
	public ponds: Position[];
	public castles: Position[];
	public craftsmen: CraftsmenPosition[];
	public match_id: number;
	public id: number;
	public walls: Position[];

	private lastTurn = 0;
	private lastAction: GameAction | null = null;

	public hashedCraftmen: { [x: number]: { [y: number]: CraftsmenPosition | null } | null };
	public hashedWalls: { [x: number]: { [y: number]: 'A' | 'B' | null } | null };
	public hashedPonds: { [x: number]: { [y: number]: Position | null } | null };
	public hashedCastles: { [x: number]: { [y: number]: Position | null } | null };

	constructor(field: Field) {
		field = JSON.parse(JSON.stringify(field)) as Field;

		this.name = field.name;
		this.castle_coeff = field.castle_coeff;
		this.wall_coeff = field.wall_coeff;
		this.territory_coeff = field.territory_coeff;
		this.width = field.width;
		this.height = field.height;
		this.ponds = field.ponds;
		this.castles = field.castles;
		this.craftsmen = field.craftsmen;
		this.match_id = field.match_id;
		this.id = field.id;

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

			if (actions[i].turn === this.lastAction?.turn && actions[i].id !== this.lastAction.id) {
				this.revertLastAction();
			}

			for (const action of actions[i].actions) {
				for (const craftsman of this.craftsmen) {
					if (craftsman.id === action.craftsman_id) this.craftsmanDoAction(craftsman, action);
				}
			}

			this.lastTurn = actions[i].turn;
			this.lastAction = actions[i];
		}
	}

	private revertLastAction() {
		if (!this.lastAction) return;

		for (const action of this.lastAction.actions) {
			for (const craftsman of this.craftsmen) {
				if (craftsman.id === action.craftsman_id) this.craftmanRevertAction(craftsman, action);
			}
		}
	}

	private craftmanRevertAction(craftsman: CraftsmenPosition, action: Action) {
		switch (action.action) {
			case 'MOVE':
				return this.craftsmanDoAction(craftsman, {
					...action,
					action_param: revertActionParam[
						action.action_param as keyof typeof revertActionParam
					] as EActionParam,
				});
			case 'BUILD':
				return this.craftsmanDoAction(craftsman, { ...action, action: 'DESTROY' });
			case 'DESTROY':
				return this.craftsmanDoAction(craftsman, { ...action, action: 'BUILD' });
			default:
				break;
		}
	}

	private craftsmanDoAction(craftsman: CraftsmenPosition, action: Action) {
		switch (action.action) {
			case 'MOVE':
				switch (action.action_param) {
					case 'DOWN':
						this.moveCraftsmen(craftsman, { x: 0, y: 1 }, action);
						break;

					case 'UP':
						this.moveCraftsmen(craftsman, { x: 0, y: -1 }, action);
						break;

					case 'LEFT':
						this.moveCraftsmen(craftsman, { x: -1, y: 0 }, action);
						break;

					case 'RIGHT':
						this.moveCraftsmen(craftsman, { x: 1, y: 0 }, action);
						break;

					case 'LOWER_LEFT':
						this.moveCraftsmen(craftsman, { x: -1, y: 1 }, action);
						break;

					case 'LOWER_RIGHT':
						this.moveCraftsmen(craftsman, { x: 1, y: 1 }, action);
						break;

					case 'UPPER_LEFT':
						this.moveCraftsmen(craftsman, { x: -1, y: -1 }, action);
						break;

					case 'UPPER_RIGHT':
						this.moveCraftsmen(craftsman, { x: 1, y: -1 }, action);
						break;
				}
				break;

			case 'BUILD':
				switch (action.action_param) {
					case 'LEFT':
						this.buildWall({ x: craftsman.x - 1, y: craftsman.y }, craftsman.side, action);
						break;

					case 'RIGHT':
						this.buildWall({ x: craftsman.x + 1, y: craftsman.y }, craftsman.side, action);
						break;

					case 'ABOVE':
						this.buildWall({ x: craftsman.x, y: craftsman.y - 1 }, craftsman.side, action);
						break;

					case 'BELOW':
						this.buildWall({ x: craftsman.x, y: craftsman.y + 1 }, craftsman.side, action);
						break;
				}
				break;

			case 'DESTROY':
				switch (action.action_param) {
					case 'LEFT':
						this.destroy({ x: craftsman.x - 1, y: craftsman.y }, action);
						break;

					case 'RIGHT':
						this.destroy({ x: craftsman.x + 1, y: craftsman.y }, action);
						break;

					case 'ABOVE':
						this.destroy({ x: craftsman.x, y: craftsman.y - 1 }, action);
						break;

					case 'BELOW':
						this.destroy({ x: craftsman.x, y: craftsman.y + 1 }, action);
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
		if (!this.canCraftsmenMove({ x: craftsmen.x + pos.x, y: craftsmen.y + pos.y }, craftsmen)) {
			action.action = 'STAY';
			return;
		}

		this.removeHashedCraftmen(craftsmen);

		craftsmen.x += pos.x;
		craftsmen.y += pos.y;

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
}

export default GameState;
