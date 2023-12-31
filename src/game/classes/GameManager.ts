import { EMoveParam } from '@/constants';
import { moveParams } from '@/constants/action-params';
import Action from '@/models/Action';
import GameAction from '@/models/GameAction';
import { ActionDto } from '@/services/player.service';
import randomField, { RandomFieldOptions } from '@/utils/randomField';
import sortActions from '@/utils/sortActions';
import { EWallSide } from '../enums/EWallSide';
import IGameManager from '../interfaces/IGameManager';
import IGameStateData from '../interfaces/IGameStateData';
import BaseGameManager from './BaseGameManager';
import CraftsmenPosition from './CraftsmenPosition';
import HashedType from './HashedType';
import Position from './Position';
import PriorityQueue from './PriorityQueue';
import WallPosition from './WallPosition';

/**
 * @description Game manager
 * @implements GameStateData
 */
export default class GameManager extends BaseGameManager implements IGameManager {
	private prevTurnScoreUpdated: number = 0;

	public toObject(): IGameStateData {
		const object = JSON.parse(JSON.stringify(this)) as IGameStateData;

		return {
			castle_coeff: object.castle_coeff,
			castles: object.castles,
			craftsmen: object.craftsmen,
			height: object.height,
			id: object.id,
			lastTurn: object.lastTurn,
			match_id: object.match_id,
			name: object.name,
			ponds: object.ponds,
			scores: object.scores,
			scoresHistory: object.scoresHistory,
			sides: object.sides,
			territory_coeff: object.territory_coeff,
			wall_coeff: object.wall_coeff,
			walls: object.walls,
			width: object.width,
			buildPositions: object.buildPositions,
			destroyPositions: object.destroyPositions,
			targetPositions: object.targetPositions,
			scorePositions: object.scorePositions,
		};
	}

	public addActions(actions: GameAction[], maxTurn: number = Infinity): void {
		// If there is no action, do nothing
		if (!actions.length) return;

		// Timestamp of start time
		const startTime = Date.now();

		for (let i = 0; i < actions.length; i++) {
			if (actions[i].turn > maxTurn) break; //  Nếu turn của action lớn hơn maxTurn thì cút

			if (actions[i].turn <= this.lastTurn) {
				// If the turn is less than or equal to the last turn, then do nothing
				continue;
			}

			if (actions[i].turn === actions[i + 1]?.turn) {
				// If current turn is equal to next turn, then do nothing
				actions[i].disabled = true;
				continue;
			}

			actions[i].actions = sortActions(actions[i].actions);

			// Find craftsmen by id and do action
			for (const action of actions[i].actions) {
				for (const craftsman of this.craftsmen) {
					if (craftsman.id === action.craftsman_id) this.craftsmanDoAction(craftsman, action);
				}
			}

			// Update last turn
			this.lastTurn = actions[i].turn;

			// Update scores after add action
			this.updateScores();
		}

		// Timestamp of end time
		const endTime = Date.now();

		// Log time to add actions
		console.log(`Time to add actions: ${endTime - startTime}ms`);
	}

	/**
	 * @description Get position of craftsmen
	 * @param craftsman - Craftsman
	 * @param action - Action
	 * @returns Whether the craftsman can do action
	 */
	protected craftsmanDoAction(craftsman: CraftsmenPosition, action: Action): void {
		if (!this.canCrafsmenDoAction(craftsman, action)) return;

		switch (action.action) {
			case 'MOVE':
				this.craftsmenMove(craftsman, craftsman.getPositionByActionParam(action.action_param!));
				break;

			case 'BUILD':
				this.craftsmenBuildWall(craftsman.getPositionByActionParam(action.action_param!), craftsman.side);
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

	/**
	 * @description Destroy wall
	 * @param pos - Position
	 * @returns Whether the position is a pond
	 */
	protected destroyWall(pos: Position): void {
		// If the position is not a wall, then do nothing
		if (!this.hashedWalls.exist(pos)) return;

		const prevSide = this.hashedWalls.read(pos)?.side;

		// Start removing wall
		this.hashedWalls.remove(pos);
		this.walls = this.walls.filter((e) => !e.isEquals(pos));

		// Update side after removing wall
		this.updateSideFromPosition(pos, prevSide);
	}

	/**
	 * @description Move craftsmen to position
	 * @param craftsmen - Craftsman
	 * @param pos - Position
	 */
	protected craftsmenMove(craftsmen: CraftsmenPosition, pos: Position): void {
		// Remove old position
		this.hashedCraftmens.remove(craftsmen);

		// Update side after removing old position
		craftsmen.x = pos.x;
		craftsmen.y = pos.y;

		// Add new position
		this.hashedCraftmens.write(craftsmen, craftsmen);
	}

	/**
	 * @description Build wall at position
	 * @param pos - Position
	 * @param side - Side
	 */
	protected craftsmenBuildWall(pos: Position, side: EWallSide): void {
		// Create new wall
		const wall = new WallPosition(pos.x, pos.y, side);
		// Add new wall to list of walls
		this.walls.push(wall);
		// Hash new wall to hashed walls
		this.hashedWalls.write(wall, wall);

		// Get nearby positions of new wall and update side
		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			this.updateSideFromPosition(position, this.hashedSide.read(position) || side);
		}

		this.hashedSide.remove(pos);
	}

	/**
	 * @description Check if the position is a pond
	 * @param pos - Position
	 * @returns Whether the position is a pond
	 */
	protected canCraftsmenDestroy(pos: Position): boolean {
		// Craftsmen can destroy wall if the position is a wall
		return this.hashedWalls.exist(pos);
	}

	/**
	 * @description Check if the craftsmen can move to position
	 * @param craftsmen - Craftsman
	 * @param pos - Position
	 * @returns Whether the craftsmen can move to position
	 */
	protected canCraftsmenMove(craftsmen: CraftsmenPosition, pos: Position): boolean {
		// Craftsmen can move if the position is valid and not a wall, a pond or a craftsmen
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedWalls.exist(pos) && craftsmen.side !== this.hashedWalls.read(pos)!.side) return false;

		return true;
	}

	/**
	 * @description Check if the craftsmen can build wall at position
	 * @param pos - Position
	 * @returns Whether the craftsmen can build wall at position
	 */
	protected canCraftsmenBuildWall(pos: Position): boolean {
		if (!pos.isValid(this.width, this.height)) return false;
		if (this.hashedPonds.exist(pos)) return false;
		if (this.hashedCraftmens.exist(pos)) return false;
		if (this.hashedWalls.exist(pos)) return false;
		if (this.hashedCastles.exist(pos)) return false;

		return true;
	}

	/**
	 * @description Check if the craftsmen can do action
	 * @param craftmen - Craftsmen
	 * @param action - Action
	 * @returns Whether the craftsmen can do action
	 */
	protected canCrafsmenDoAction(craftmen: CraftsmenPosition, action: ActionDto): boolean {
		// Get position to do action
		const nextPos = craftmen.getPositionByActionParam(action.action_param || 'ABOVE');

		switch (action.action) {
			case 'STAY':
				return true;
			case 'MOVE':
				return this.canCraftsmenMove(craftmen, nextPos);
			case 'BUILD':
				return this.canCraftsmenBuildWall(nextPos);
			case 'DESTROY':
				return this.canCraftsmenDestroy(nextPos);
		}
	}

	/**
	 * @description Get action to go to position
	 * @param craftmen - Craftsmen
	 * @param targetPos - Position
	 * @returns Action to go to position or null
	 */
	protected getActionToGoToPosition(craftmen: CraftsmenPosition, targetPos: Position): ActionDto | null {
		const queue = new PriorityQueue<{ from: Position; to: Position; direction: EMoveParam }>();
		const visited = new HashedType<boolean>();
		const dist = new HashedType<number>();

		const nears = craftmen.allNears();

		for (const i in nears) {
			queue.enQueue({ from: nears[i], to: nears[i], direction: moveParams[i] }, 1);
			dist.write(nears[i], 1);
		}

		let minDist = Infinity;
		let finalAction: ActionDto | null = null;

		while (!queue.isEmpty()) {
			const top = queue.deQueue();
			const pos = top.value.to;
			const d = top.priority;

			if (d >= minDist) continue;

			if (!this.isValidPosition(pos)) continue;
			if (this.hashedPonds.exist(pos)) continue;
			if (this.hashedCraftmens.exist(pos)) continue;
			if (this.hashedWalls.exist(pos) && this.hashedWalls.read(pos)!.side !== craftmen.side) continue;

			if (pos.isEquals(targetPos)) {
				if (top.priority + 1 < minDist) {
					minDist = d + 1;
					finalAction = craftmen.getMoveAction(top.value.direction);
				}
			}

			if (visited.exist(pos)) continue;
			visited.write(pos, true);

			for (const near of pos.allNears()) {
				queue.enQueue({ from: top.value.from, to: near, direction: top.value.direction }, d + 1);
				if (!dist.exist(near) || dist.read(near)! > d + 1) dist.write(near, d + 1);
			}
		}

		return finalAction;
	}

	/**
	 * @description Get actions to go to position
	 * @param craftsmen - Craftsmen
	 * @returns Actions to go to position
	 */
	protected getAvailableActions(craftsmen: CraftsmenPosition): ActionDto[] {
		return craftsmen.getAllActions().filter((action) => this.canCrafsmenDoAction(craftsmen, action));
	}

	protected getRandomAvailableActions(craftsmen: CraftsmenPosition): ActionDto[] {
		const availableActions = this.getAvailableActions(craftsmen);

		const randomIndexs = [
			Math.floor(Math.random() * availableActions.length),
			Math.floor(Math.random() * availableActions.length),
		];

		return [availableActions[randomIndexs[0]], availableActions[randomIndexs[1]]];
	}
	/**
	 * @description Get side of position
	 * @param pos - Position
	 * @param currentSide - Current side
	 * @param visited - Visited positions
	 * @returns Side of position
	 */
	private sideOf(
		pos: Position,
		currentSide: EWallSide | null = null,
		visited: HashedType<boolean> = new HashedType<boolean>(),
	): EWallSide | null {
		// If the position is not valid, then return null
		if (!pos.isValid(this.width, this.height)) return null;
		if (this.hashedWalls.exist(pos)) {
			// If the position is a wall and the current side is null, then return side of the wall
			if (!currentSide) return this.hashedWalls.read(pos)!.side;
			// If the position is a wall and the side of wall is not equal to current side, then return null
			if (this.hashedWalls.read(pos)!.side === currentSide) return currentSide;
		}

		// Mark the position as visited
		visited.write(pos, true);

		// Get nearby positions
		const positions = pos.topRightBottomLeft();

		for (const position of positions) {
			// If the position is visited, then do nothing
			if (visited.exist(position)) continue;

			// Get side of position
			const newSide = this.sideOf(position, currentSide, visited);

			// If the side of position is null, then return null
			if (!newSide) return null;

			// If the current side is null, then set current side to new side
			if (!currentSide) currentSide = newSide;
			// If the current side is not equal to new side, then return null
			else if (currentSide !== newSide) return null;
		}

		// Return final side
		return currentSide;
	}

	/**
	 * @description Fill side of position and nearby positions
	 * @param pos - Position
	 * @param side - Side to fill
	 * @param filled - Filled positions
	 */
	private fillSide(
		pos: Position,
		side: EWallSide | null,
		filled: HashedType<boolean> = new HashedType<boolean>(),
	): void {
		// If the position is not valid, then do nothing
		if (!pos.isValid(this.width, this.height)) return;
		// If the position is filled, then do nothing
		if (filled.exist(pos)) return;

		// If the position is a wall
		if (this.hashedWalls.exist(pos)) {
			// If the side is null, then do nothing
			if (!side) return;
			// If the side of wall is equal to side, then do nothing
			if (side === this.hashedWalls.read(pos)!.side) return;
		}

		// Mark the position as filled
		filled.write(pos, true);

		if (this.hashedSide.exist(pos)) {
			if (side && side !== this.hashedSide.read(pos)) this.hashedSide.write(pos, 'AB');
		} else {
			// If the side is not null, then hash the side to hashed side
			if (side) this.hashedSide.write(pos, side);
			// Else remove the position from hashed side
			else this.hashedSide.remove(pos);
		}

		// Get nearby positions and fill side of them
		const positions = pos.topRightBottomLeft();
		for (const pos of positions) {
			this.fillSide(pos, side, filled);
		}
	}

	/**
	 * @description Update side from position
	 * @param pos - Position
	 * @param initSide - Initial side
	 * @param visited - Visited positions
	 * @param filled - Filled positions
	 */
	private updateSideFromPosition(pos: Position, initSide: EWallSide | null = null): void {
		// Get side of position
		const updatedSide = this.sideOf(pos, initSide, new HashedType<boolean>());

		// Fill side of position and nearby positions
		this.fillSide(pos, updatedSide, new HashedType<boolean>());

		// Update sides from hashed side
		this.sides = this.hashedSide.toList();
	}

	/**
	 * @description Update scores of teams
	 */
	private updateScores() {
		const sides = Object.keys(this.scores) as EWallSide[];

		for (const side of sides) {
			// Calculate score of walls
			this.scores[side].walls = this.walls.reduce((prev, wall) => {
				if (wall.side !== side) return prev;
				return prev + this.wall_coeff;
			}, 0);

			// Calculate score of castles
			this.scores[side].castles = this.castles.reduce((prev, castle) => {
				if (this.hashedSide.read(castle) !== side) return prev;
				return prev + this.castle_coeff;
			}, 0);

			// Calculate score of territories
			this.scores[side].territories = this.sides.reduce((prev, currentSide) => {
				if (currentSide.data !== side && currentSide.data !== 'AB') return prev;

				return prev + this.territory_coeff;
			}, 0);

			// Calculate total score
			this.scores[side].total =
				this.scores[side].castles + this.scores[side].territories + this.scores[side].walls;
		}

		// Update scores history
		while (this.prevTurnScoreUpdated < this.lastTurn) {
			this.prevTurnScoreUpdated++;
			for (const side of sides) {
				this.scoresHistory[side][this.prevTurnScoreUpdated] = { ...this.scores[side] };
			}
		}
	}

	public getNextActions(side: EWallSide): ActionDto[] {
		this.goingTo = new HashedType<Position>();

		const craftmens = this.getCraftsmansBySide(side);
		const actions = craftmens.map((craftmen) => this.getNextCraftsmenAction(craftmen));

		this.goingTo = new HashedType<Position>();

		return actions;
	}

	/**
	 * @description Get next action for craftsmen
	 * @param craftsmen - Craftsman
	 * @returns Action
	 */
	protected getNextCraftsmenAction(craftsmen: CraftsmenPosition): ActionDto {
		return craftsmen.getStayAction();
	}

	public async getNextActionsAsync(side: EWallSide): Promise<ActionDto[]> {
		this.goingTo = new HashedType<Position>();

		const craftmens = this.getCraftsmansBySide(side);
		const actions = craftmens.map((craftmen) => this.getNextCraftsmenActionAsync(craftmen));

		this.goingTo = new HashedType<Position>();

		return await Promise.all(actions);
	}

	private async getNextCraftsmenActionAsync(craftmen: CraftsmenPosition): Promise<ActionDto> {
		return this.getNextCraftsmenAction.bind(this)(craftmen);
	}

	/**
	 * @description Create a random game
	 * @param options - Random field option
	 * @param numberOfTurns - Number of turns
	 * @returns - Random game
	 */
	public static randomGame(options?: RandomFieldOptions, numberOfTurns?: number): GameManager {
		const randomedField = randomField(options);
		const randomedGame = new GameManager(randomedField, numberOfTurns);

		return randomedGame;
	}

	/**
	 * @description Check if position is valid
	 * @param pos - Position
	 * @returns True if position is valid
	 */
	protected isValidPosition(pos: Position): boolean {
		return !!pos?.isValid(this.width, this.height);
	}

	protected isInSide(pos: Position, side: EWallSide): boolean {
		if (!this.isValidPosition(pos)) return false;
		if (this.hashedSide.read(pos) === side) return true;
		if (!this.hashedWalls.exist(pos)) return false;
		return pos
			.topRightBottomLeft()
			.every(
				(e) =>
					this.hashedSide.read(e) === side ||
					(this.hashedWalls.exist(e) && this.hashedWalls.read(e)!.side === side),
			);
	}
}
