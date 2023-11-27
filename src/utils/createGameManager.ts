import { CaroGameManager, GameManager } from '@/game/classes';
import BorderGameManager from '@/game/classes/BorderGameManager';
import { EGameMode } from '@/game/enums';
import Field from '@/models/Field';

/**
 * @description Create game manager by game mode @see EGameMode
 * @param field - Field
 * @param numberOfTurns - Number of turns
 * @param gameMode - Game mode
 * @returns - Game manager
 */
export default function createGameManager(field: Field, numberOfTurns: number, gameMode: EGameMode): GameManager {
	switch (gameMode) {
		case 'Caro':
			return new CaroGameManager(field, numberOfTurns);
		case 'A*':
			return new GameManager(field, numberOfTurns);
		case 'Border':
			return new BorderGameManager(field, numberOfTurns);
	}
}
