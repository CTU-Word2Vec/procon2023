import { CaroGameManager } from '@/game/classes';
import Field from '@/models/Field';
import { describe, expect, it } from 'vitest';

const gameField = {
	castle_coeff: 20,
	castles: [
		{
			x: 5,
			y: 3,
		},
		{
			x: 6,
			y: 6,
		},
	],
	craftsmen: [
		{
			x: 2,
			y: 2,
			id: '0',
			side: 'A',
		},
		{
			x: 7,
			y: 4,
			id: '1',
			side: 'A',
		},
		{
			x: 9,
			y: 5,
			id: '2',
			side: 'B',
		},
		{
			x: 3,
			y: 4,
			id: '3',
			side: 'B',
		},
	],
	height: 10,
	id: 0,
	lastTurn: 17,
	match_id: 0,
	name: 'Random Field',
	ponds: [
		{
			x: 7,
			y: 8,
		},
		{
			x: 8,
			y: 5,
		},
		{
			x: 3,
			y: 2,
		},
		{
			x: 2,
			y: 1,
		},
		{
			x: 2,
			y: 4,
		},
	],
	territory_coeff: 5,
	wall_coeff: 1,
	width: 10,
};

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
