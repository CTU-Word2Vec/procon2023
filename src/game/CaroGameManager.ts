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

			const action = this.getNextCraftsmenAction(craftmen);

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

	private getNextCraftsmenAction(craftmen: CraftsmenPosition): ActionDto | null {
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

			const canBuild = !!this.getBuildActionFromPosition(pos, craftmen.side);

			if (canBuild) {
				return pos;
			}

			positions.push(...pos.upperLeftUpperRightLowerRightLowerLeft(), ...pos.topRightBottomLeft());
		}

		return null;
	}

	private getBuildAction(craftmen: CraftsmenPosition): ActionDto {
		const action = this.getBuildActionFromPosition(craftmen, craftmen.side);

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

	private getBuildActionFromPosition(pos: Position, side: EWallSide): EBuildDestryParam | null {
		const positions = pos.topRightBottomLeft();
		const actionParams: EBuildDestryParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];

		for (let i = 0; i < positions.length; i++) {
			const position = positions[i];
			const param = actionParams[i];

			if (!this.willBeBuild(position, side)) continue;

			return param;
		}

		return null;
	}

	private willBeBuild(pos: Position, side: EWallSide): boolean {
		if (!this.canBuildWall(pos)) return false;
		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			if (this.hashedWalls.read(position)?.side === side) return false;
		}

		return true;
	}

	private findClosestCastle(craftsmen: CraftsmenPosition) {
		let min = Infinity;
		let closestCastle: Position | null = null;

		for (const castle of this.castles) {
			if (this.goingTo.exist(castle)) continue;
			if (this.hashedCraftmen.exist(castle) && !craftsmen.equals(castle)) continue;

			const distance = craftsmen.distance(castle);

			if (this.isOurCastle(new CraftsmenPosition(castle.x, castle.y, craftsmen.id, craftsmen.side))) continue;

			if (distance < min) {
				min = distance;
				closestCastle = castle;
			}
		}

		return closestCastle;
	}

	private isOurCastle(craftmen: CraftsmenPosition) {
		const positions = craftmen.topRightBottomLeft();

		return positions.every((pos) => {
			if (!pos.isValid(this.width, this.height)) return true;
			return this.hashedWalls.read(pos)?.side === craftmen.side;
		});
	}

	private getDestroyAction(craftsmen: CraftsmenPosition): ActionDto | null {
		const positions = craftsmen.topRightBottomLeft();
		const actionParams: EBuildDestryParam[] = ['ABOVE', 'RIGHT', 'BELOW', 'LEFT'];

		for (let i = 0; i < positions.length; i++) {
			const pos = positions[i];
			const param = actionParams[i];

			if (!this.hashedWalls.exist(pos)) continue;
			if (this.hashedWalls.read(pos)!.side === craftsmen.side) continue;

			return {
				craftsman_id: craftsmen.id,
				action: 'DESTROY',
				action_param: param,
			};
		}

		return null;
	}
}
