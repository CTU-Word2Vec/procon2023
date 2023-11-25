import { EAction } from '@/constants/action';
import { EActionParam } from '@/constants/action-params';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import Position, { CraftsmenPosition } from '@/models/Position';
import createClient from '@/utils/createClient';
import { AxiosInstance } from 'axios';

export interface ActionDto {
	action: EAction;
	action_param?: EActionParam;
	craftsman_id: string;
}

export interface CreateActionDto {
	turn: number;
	actions: ActionDto[];
}

export interface CreateActionResponse {
	action: GameAction;
	status: {
		cur_turn: number;
		max_turn: number;
		remaining: number;
	};
}

export interface GetTimeResponse {
	time: Date | string;
}

export class PlayerService {
	constructor(private client: AxiosInstance = createClient('player')) {}

	async getGames() {
		const games = (await this.client.get('/games')) as Game[];
		return games.map((game) => {
			game.field.ponds = JSON.parse(game.field.ponds as unknown as string) as Position[];
			game.field.castles = JSON.parse(game.field.castles as unknown as string) as Position[];
			game.field.craftsmen = JSON.parse(game.field.craftsmen as unknown as string) as CraftsmenPosition[];

			return game;
		});
	}

	async getGameById(gameId: number) {
		const game = (await this.client.get(`/games/${gameId}`)) as Game;

		game.field.ponds = JSON.parse(game.field.ponds as unknown as string) as Position[];
		game.field.castles = JSON.parse(game.field.castles as unknown as string) as Position[];
		game.field.craftsmen = JSON.parse(game.field.craftsmen as unknown as string) as CraftsmenPosition[];

		return game;
	}

	async getGameStatus(gameId: number) {
		return (await this.client.get(`/games/${gameId}/status`)) as {
			cur_turn: number;
			max_turn: number;
			remaining: number;
		};
	}

	async getGameActions(gameId: number) {
		const actions = (await this.client.get(`/games/${gameId}/actions`)) as GameAction[];
		return actions.sort((a, b) => a.turn - b.turn);
	}

	async createAction(gameId: number, body: CreateActionDto) {
		return (await this.client.post(`/games/${gameId}/actions`, body)) as CreateActionResponse;
	}

	async getTime() {
		return (await this.client.get('/time')) as GetTimeResponse;
	}
}

export default new PlayerService() as PlayerService;
