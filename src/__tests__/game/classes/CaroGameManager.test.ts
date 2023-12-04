import * as gameField from '@/__tests__/mocks/games/1.json';
import { CaroGameManager } from '@/game/classes';
import Field from '@/models/Field';
import { describe, expect, it } from 'vitest';

describe('CaroGameManager', () => {
	it('game field should be defined', () => {
		expect(gameField).to.be.toBeDefined();
	});
	it('test get actions', () => {
		const gm = new CaroGameManager(gameField as Field);

		const nextActions = gm.getNextActions('A');

		expect(nextActions.every((act) => act.action !== 'STAY')).toBeTruthy();
	});
});
