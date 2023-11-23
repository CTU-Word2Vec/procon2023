import { CraftsmenPosition } from '@/game/CraftsmenPosition';
import { HashedType } from '@/game/HashedType';
import { Position } from '@/game/Position';
import Field from '@/models/Field';

/**
 * @description Random field options
 */
export interface RandomFieldOptions {
	/**
	 * @description Field width
	 * @default 10
	 */
	width?: number;

	/**
	 * @description Field height
	 * @default 10
	 */
	height?: number;

	/**
	 * @description Score of castle
	 * @default 1
	 */
	castle_coeff?: number;

	/**
	 * @description Score of wall
	 * @default 20
	 */
	wall_coeff?: number;

	/**
	 * @description Score of territory
	 * @default 5
	 */
	territory_coeff?: number;

	/**
	 * @description Number of ponds
	 * @default 5
	 */
	numOfPonds?: number;

	/**
	 * @description Number of castles
	 * @default 5
	 */
	numOfCastles?: number;

	/**
	 * @description Number of craftsmens
	 * @default 5
	 */
	numOfCraftsmens?: number;
}

/**
 * @description Random game field
 * @param options - Random field options
 * @returns Field
 * @throws {Error} Invalid width or height
 * @throws {Error} Invalid coefficients
 * @throws {Error} Invalid number of objects
 * @throws {Error} To many object
 */
export default function randomField(
	{
		width = 10,
		height = 10,
		wall_coeff = 1,
		castle_coeff = 20,
		territory_coeff = 5,
		numOfPonds = 5,
		numOfCastles = 5,
		numOfCraftsmens = 5,
	}: RandomFieldOptions = {
		width: 10,
		height: 10,
		wall_coeff: 1,
		castle_coeff: 20,
		territory_coeff: 5,
		numOfPonds: 5,
		numOfCastles: 5,
		numOfCraftsmens: 5,
	},
): Field {
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
