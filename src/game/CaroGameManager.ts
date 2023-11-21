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
			actions.push(action);
		}

		this.goingTo = new HashedType<Position>();

		const endTime = Date.now();

		console.log(`Time to get next actions: ${endTime - startTime}ms`);

		return actions;
	}

	private getNextCraftsmenAction(craftmen: CraftsmenPosition): ActionDto {
		const destroyAction = this.getDestroyAction(craftmen);
		if (destroyAction) return destroyAction;

		const gotoClosestCastleAction = this.gotoClosestCastleAction(craftmen);
		if (gotoClosestCastleAction) return gotoClosestCastleAction;

		const buildAction = this.getBuildAction(craftmen);
		if (buildAction) return buildAction;

		const pos = this.getNextPosition(craftmen);

		if (!pos)
			return {
				action: 'STAY',
				craftsman_id: craftmen.id,
			};

		const nextActions = this.getActionToGoToPosition(craftmen, pos);

		if (nextActions) return nextActions;

		return {
			action: 'STAY',
			craftsman_id: craftmen.id,
		};
	}

	private gotoClosestCastleAction(craftmen: CraftsmenPosition): ActionDto | null {
		const closestCastle = this.findClosestCastle(craftmen);
		if (!closestCastle) return null;

		this.goingTo.write(closestCastle, closestCastle);

		return this.getActionToGoToPosition(craftmen, closestCastle);
	}

	private getNextPosition(craftmen: CraftsmenPosition): Position | null {
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

	private getBuildAction(craftmen: CraftsmenPosition): ActionDto | null {
		const action = this.getBuildActionFromPosition(craftmen, craftmen.side);

		if (!action) return null;

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
		if (!this.canCraftsmenBuildWall(pos)) return false;
		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			if (this.hashedWalls.read(position)?.side === side) return false;
		}

		return true;
	}

	private findClosestCastle(craftsmen: CraftsmenPosition): Position | null {
		let min = Infinity;
		let closestCastle: Position | null = null;

		for (const castle of this.castles) {
			if (this.goingTo.exist(castle)) continue;
			if (this.hashedCraftmen.exist(castle) && !craftsmen.equals(castle)) continue;
			if (this.hashedSide.read(castle) === craftsmen.side) continue;
			if (!this.canBuildOrDestroy(castle, craftsmen.side)) continue;

			const distance = craftsmen.distance(castle);

			if (distance === 0) return null;

			if (distance < min) {
				min = distance;
				closestCastle = castle;
			}
		}

		return closestCastle;
	}

	private canBuildOrDestroy(pos: Position, side: EWallSide): boolean {
		const positions = pos.topRightBottomLeft();

		return positions.some((pos) => {
			if (!pos.isValid(this.width, this.height)) return false;
			if (this.hashedCraftmen.exist(pos)) return false;
			if (this.hashedPonds.exist(pos)) return false;
			if (this.hashedCastles.exist(pos)) return false;
			if (this.hashedWalls.read(pos)?.side === side) return false;

			return true;
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

			this.goingTo.write(pos, pos);

			return {
				craftsman_id: craftsmen.id,
				action: 'DESTROY',
				action_param: param,
			};
		}

		return null;
	}
}
