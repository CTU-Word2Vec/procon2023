import { EGameMode, EWallSide } from '@/game/enums';
import IGameStateData from '@/game/interfaces/IGameStateData';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService, { CreateActionDto } from '@/services/player.service';
import { createGameManager } from '.';
import wait from './wait';

/**
 * @description Play real options
 */
export interface PlayRealOptions {
	/**
	 * @description Game
	 */
	game: Game;
	/**
	 * @description Side
	 */
	side: EWallSide;
	/**
	 * @description Game mode
	 */
	gameMode?: EGameMode;
	/**
	 * @description On game state change
	 * @param gameState - Game state
	 * @returns Void
	 */
	onGameStateChange: (gameState: IGameStateData) => void;
	/**
	 * @description On game actions change
	 * @param gameActions - Game actions
	 * @returns Void
	 */
	onGameActionsChange: (gameActions: GameAction[]) => void;
	/**
	 * @description On wait time change
	 * @param waitTime - Wait time
	 * @returns Void
	 */
	onWaitTimeChange?: (waitTime: number) => void;
	/**
	 * @description On show count down
	 * @param showCountDown - Show count down
	 * @returns Void
	 */
	onShowCountDownChange?: (showCountDown: boolean) => void;
	/**
	 * @description On post error
	 * @param error - Error
	 * @returns Void
	 */
	onPostError?: (error: Error) => void;
}

/**
 * @description Play real state
 */
export const playRealState = {
	/**
	 * @description Playing
	 */
	playing: false,
};

/**
 * @description Play real
 * @param options - Options
 */
export default async function playReal({
	game,
	side,
	gameMode = 'Caro',
	onWaitTimeChange,
	onShowCountDownChange,
	onGameStateChange,
	onGameActionsChange,
	onPostError,
}: PlayRealOptions) {
	// Set playing state to true
	playRealState.playing = true;

	const gameManager = createGameManager(game.field, game.num_of_turns, gameMode); // * Tạo game manager từ field, số lượt đi và giải thuật

	const actions = await playerService.getGameActions(game.id); // * Lấy các action đã đi trước đó
	gameManager.addActions(actions); // * Thêm các action đã đi vào game manager

	onGameStateChange(gameManager.toObject()); // * Cập nhật lại game state

	const status = await playerService.getTime(); // * Lấy thời gian hiện tại của server

	const now = new Date(status.time).getTime(); // * Lấy thời gian hiện tại
	const startTime = new Date(game.start_time).getTime(); // * Lấy thời gian bắt đầu game

	let waitTime = 0; // * Thời gian chờ

	if (now >= startTime) {
		// * Nếu thời gian hiện tại lớn hơn thời gian bắt đầu game, nghĩa là game đã bắt đầu => Chờ đến lượt đi tiếp theo
		waitTime = game.time_per_turn * 1000 - ((now - startTime) % (game.time_per_turn * 1000));
	} else {
		// * Nếu thời gian hiện tại nhỏ hơn thời gian bắt đầu game, nghĩa là game chưa bắt đầu => Chờ đến thời gian bắt đầu game
		waitTime = startTime - now;
	}

	onWaitTimeChange?.(waitTime); // * Cập nhật lại thời gian chờ
	await wait(waitTime); // * Chờ đến thời gian bắt đầu game
	onWaitTimeChange?.(0); // * Cập nhật lại thời gian chờ

	onShowCountDownChange?.(true); // * Hiển thị đếm ngược

	for (; playRealState.playing; ) {
		// * Vòng lặp chính
		const actions = await playerService.getGameActions(game.id); // * Lấy các action đã đi trước đó
		const { cur_turn } = await playerService.getGameStatus(game.id); // * Lấy lượt đi hiện tại, nếu qua lượt đi thì sẽ quăng lỗi
		if (cur_turn > game.num_of_turns) break; // * Nếu lượt đi hiện tại lớn hơn số lượt đi thì thoát khỏi vòng lặp

		onGameActionsChange(actions); // * Cập nhật lại các action đã đi
		gameManager.addActions(actions); // * Thêm các action đã đi vào game manager
		onGameStateChange(gameManager.toObject()); // * Cập nhật lại game state

		const myTurn = // * Kiểm tra xem có phải lượt đi của mình không (đi trước 1 lượt)
			(side === 'A' && cur_turn % 2 === 0) || // * Nếu là side A thì lượt đi lẻ (đi trước 1 lượt)
			(side === 'B' && cur_turn % 2 !== 0); // * Nếu là side B thì lượt đi chẵn (đi trước 1 lượt)
		if (myTurn) {
			const body: CreateActionDto = {
				turn: cur_turn + 1,
				actions: await gameManager.getNextActionsAsync(side),
			};

			await playerService.createAction(game.id, body).catch((error) => onPostError?.(error));
		}

		const { remaining } = await playerService.getGameStatus(game.id); // * Lấy thời gian còn lại

		await wait(remaining * 1000); // * Chờ đến lượt đi tiếp theo
	}

	// Set playing state to false
	playRealState.playing = false;
}
