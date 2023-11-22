import GameStatus from '@/models/GameStatus';
import Position, { CraftsmenPosition } from '@/models/Position';
import createClient from '@/utils/createClient';
import { AxiosInstance } from 'axios';

/**
 * @description Game service
 */
export class GameService {
	/**
	 * @description Constructor
	 * @param client Axios client
	 */
	constructor(private readonly client: AxiosInstance = createClient('games')) {}

	/**
	 * @description Get game status
	 * @param gameId - Game id
	 * @returns {Promise<GameStatus>} Game status
	 */
	async getGameStatus(gameId: number): Promise<GameStatus> {
		const status = (await this.client.get(`/${gameId}/status`)) as GameStatus;

		status.craftsmen = JSON.parse(status.craftsmen as unknown as string) as CraftsmenPosition;
		status.walls = JSON.parse(status.walls as unknown as string) as Position;

		return status;
	}
}

export default new GameService() as GameService;
