import { CraftsmenPosition } from '@/game/CraftsmenPosition';
import { HashedType } from '@/game/HashedType';
import { Position } from '@/game/Position';
import Field from '@/models/Field';

export interface RandomFieldOptions {
	width?: number;
	height?: number;
	castle_coeff?: number;
	wall_coeff?: number;
	territory_coeff?: number;
	numOfPonds?: number;
	numOfCastles?: number;
	numOfCraftsmens?: number;
}

export default function randomField({
	width = 10,
	height = 10,
	wall_coeff = 1,
	castle_coeff = 20,
	territory_coeff = 1,
	numOfPonds = 5,
	numOfCastles = 5,
	numOfCraftsmens = 5,
}: RandomFieldOptions): Field {
	if (width <= 0 || height <= 0) {
		throw new Error('Invalid width or height');
	}

	if (wall_coeff < 0 || castle_coeff < 0 || territory_coeff < 0) {
		throw new Error('Invalid coefficients');
	}

	if (numOfPonds < 0 || numOfCastles < 0 || numOfCraftsmens < 0) {
		throw new Error('Invalid number of objects');
	}

	if (numOfPonds + numOfCastles + numOfCraftsmens * 2 > width * height) {
		throw new Error('Too many objects');
	}

	const ponds: Position[] = [];
	const castles: Position[] = [];
	const craftsmen: CraftsmenPosition[] = [];

	const usedPosition = new HashedType<Position>();

	while (ponds.length < numOfPonds) {
		const pos = Position.random(width, height);

		if (usedPosition.exist(pos)) {
			continue;
		}

		usedPosition.write(pos, pos);
		ponds.push(pos);
	}

	while (castles.length < numOfCastles) {
		const pos = Position.random(width, height);

		if (usedPosition.exist(pos)) {
			continue;
		}

		usedPosition.write(pos, pos);
		castles.push(pos);
	}

	while (craftsmen.length < numOfCraftsmens) {
		const pos = Position.random(width, height);

		if (usedPosition.exist(pos)) {
			continue;
		}

		usedPosition.write(pos, pos);
		craftsmen.push(new CraftsmenPosition(pos.x, pos.y, craftsmen.length.toString(), 'A'));
	}

	while (craftsmen.length < numOfCraftsmens * 2) {
		const pos = Position.random(width, height);

		if (usedPosition.exist(pos)) {
			continue;
		}

		usedPosition.write(pos, pos);
		craftsmen.push(new CraftsmenPosition(pos.x, pos.y, craftsmen.length.toString(), 'B'));
	}

	return {
		id: 0,
		match_id: 0,
		name: 'Random Field',
		width,
		height,
		wall_coeff,
		castle_coeff,
		territory_coeff,
		ponds,
		castles,
		craftsmen,
	};
}
