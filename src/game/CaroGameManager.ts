import { EBuildDestryParam } from '@/constants/action-params';
import { ActionDto } from '@/services/player.service';
import { CraftsmenPosition } from './CraftsmenPosition';
import GameManager from './GameManager';
import { HashedType } from './HashedType';
import { Position } from './Position';
import { EWallSide } from './WallPosition';

export default class CaroGameManager extends GameManager {
	public getNextActions(side: EWallSide): ActionDto[] {
		const startTime = Date.now();

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

		const endTime = Date.now();

		console.log(`Time to get next actions: ${endTime - startTime}ms`);

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
