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
			if (actions[i].turn <= this.lastTurn) {
				continue;
			}

			if (actions[i].turn === actions[i + 1]?.turn) {
				continue;
			}

			for (const action of actions[i].actions) {
				for (const craftsman of this.craftsmen) {
					if (craftsman.id == action.craftsman_id) this.craftsmanDoAction(craftsman, action);
				}
			}
		}

		this.lastTurn = actions[actions.length - 1].turn;
	}

	private craftsmanDoAction(craftsman: CraftsmenPosition, action: Action) {
		switch (action.action) {
			case 'MOVE':
				switch (action.action_param) {
					case 'DOWN':
						this.moveCraftsmen(craftsman, { x: 0, y: 1 });
						break;

					case 'UP':
						this.moveCraftsmen(craftsman, { x: 0, y: -1 });
						break;

					case 'LEFT':
						this.moveCraftsmen(craftsman, { x: -1, y: 0 });
						break;

					case 'RIGHT':
						this.moveCraftsmen(craftsman, { x: 1, y: 0 });
						break;

					case 'LOWER_LEFT':
						this.moveCraftsmen(craftsman, { x: -1, y: 1 });
						break;

					case 'LOWER_RIGHT':
						this.moveCraftsmen(craftsman, { x: 1, y: 1 });
						break;

					case 'UPPER_LEFT':
						this.moveCraftsmen(craftsman, { x: -1, y: -1 });
						break;

					case 'UPPER_RIGHT':
						this.moveCraftsmen(craftsman, { x: 1, y: -1 });
						break;
				}
				break;

			case 'BUILD':
				switch (action.action_param) {
					case 'LEFT':
						this.buildWall({ x: craftsman.x - 1, y: craftsman.y }, craftsman.side);
						break;

					case 'RIGHT':
						this.buildWall({ x: craftsman.x + 1, y: craftsman.y }, craftsman.side);
						break;

					case 'ABOVE':
						this.buildWall({ x: craftsman.x, y: craftsman.y - 1 }, craftsman.side);
						break;

					case 'BELOW':
						this.buildWall({ x: craftsman.x, y: craftsman.y + 1 }, craftsman.side);
						break;
				}
				break;

			case 'DESTROY':
				switch (action.action_param) {
					case 'LEFT':
						this.destroy({ x: craftsman.x - 1, y: craftsman.y });
						break;

					case 'RIGHT':
						this.destroy({ x: craftsman.x + 1, y: craftsman.y });
						break;

					case 'ABOVE':
						this.destroy({ x: craftsman.x, y: craftsman.y - 1 });
						break;

					case 'BELOW':
						this.destroy({ x: craftsman.x, y: craftsman.y + 1 });
						break;
				}
				break;

			default:
				console.log('STAY');
				break;
		}
	}

	public destroy(pos: Position) {
		if (!this.canDestroy(pos)) return;
		this.hashedWalls[pos.x]![pos.y] = null;
	}

	public canDestroy(pos: Position) {
		return !!this.hashedWalls[pos.x]?.[pos.y];
	}

	public moveCraftsmen(craftsmen: CraftsmenPosition, pos: Position) {
		if (!this.canCraftsmenMove({ x: craftsmen.x + pos.x, y: craftsmen.y + pos.y }, craftsmen)) return;

		this.removeHashedCraftmen(craftsmen);

		craftsmen.x += pos.x;
		craftsmen.y += pos.y;

		this.addHashCraftsmen(craftsmen);
	}

	public canCraftsmenMove(pos: Position, craftsmen: CraftsmenPosition) {
		if (pos.x < 0 || pos.y < 0) return false;
		if (pos.x >= this.width || pos.y >= this.height) return false;

		if (this.hashedCraftmen[pos.x]?.[pos.y]) return false;
		if (this.hashedPonds[pos.x]?.[pos.y]) return false;
		if (this.hashedCastles[pos.x]?.[pos.y]) return false;

		if (this.hashedWalls[pos.x]?.[pos.y] && craftsmen.side !== this.hashedWalls[pos.x]![pos.y]) return false;

		return true;
	}

	public addHashCraftsmen(craftsmen: CraftsmenPosition) {
		if (!this.hashedCraftmen[craftsmen.x]) {
			this.hashedCraftmen[craftsmen.x] = {};
		}

		this.hashedCraftmen[craftsmen.x]![craftsmen.y] = craftsmen;
	}

	public removeHashedCraftmen(craftsmen: CraftsmenPosition) {
		if (!this.hashedCraftmen[craftsmen.x]) return;

		this.hashedCraftmen[craftsmen.x]![craftsmen.y] = null;
	}

	public buildWall(pos: Position, side: 'A' | 'B') {
		if (!this.canBuildWall(pos)) return;
		this.walls.push(pos);

		if (!this.hashedWalls[pos.x]) {
			this.hashedWalls[pos.x] = {};
		}

		this.hashedWalls[pos.x]![pos.y] = side;
	}

	public canBuildWall(pos: Position) {
		if (this.hashedCraftmen[pos.x]?.[pos.y]) return false;
		if (this.hashedWalls[pos.x]?.[pos.y]) return false;
		if (this.hashedPonds[pos.x]?.[pos.y]) return false;
		if (this.hashedCastles[pos.x]?.[pos.y]) return false;

		return true;
	}
}

export default GameState;
