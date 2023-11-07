import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import GameStatus from '@/models/GameStatus';
import Position, { CraftsmenPosition } from '@/models/Position';
import createClient from '@/utils/createClient';
import { AxiosInstance } from 'axios';

export interface CreateActionDto {
	turn: number;
	actions: {
		action: 'MOVE' | 'BUILD' | 'STAY' | 'DESTROY';
		action_param?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'UPPER_LEFT' | 'UPPER_RIGHT' | 'LOWER_LEFT' | 'LOWER_RIGHT';
		craftsman_id: string;
	}[];
}

export interface CreateActionResponse {
	action: GameAction;
	status: GameStatus;
}

export interface GetTimeResponse {
	time: Date | string;
}

class PlayerService {
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
		return (await this.client.get(`/games/${gameId}/actions`)) as GameAction[];
	}

	async createAction(gameId: number, body: CreateActionDto) {
		return (await this.client.post(`/games/${gameId}/actions`, body)) as CreateActionResponse;
	}

	async getTime() {
		return (await this.client.get('/time')) as GetTimeResponse;
	}
}

export default new PlayerService() as PlayerService;
