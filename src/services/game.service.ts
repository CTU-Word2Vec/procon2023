import GameStatus from '@/models/GameStatus';
import Position, { CraftsmenPosition } from '@/models/Position';
import createClient from '@/utils/createClient';
import { AxiosInstance } from 'axios';

class GameService {
	constructor(private readonly client: AxiosInstance = createClient('games')) {}

	async getGameStatus(gameId: number) {
		const status = (await this.client.get(`/${gameId}/status`)) as GameStatus;

		status.craftsmen = JSON.parse(status.craftsmen as unknown as string) as CraftsmenPosition;
		status.walls = JSON.parse(status.walls as unknown as string) as Position;

		return status;
	}
}

export default new GameService() as GameService;
