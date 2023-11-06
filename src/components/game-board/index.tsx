import Field from '@/models/Field';
import Position, { CraftsmenPosition } from '@/models/Position';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import Castle from '../castle';
import CraftsmenA from '../craftsmen-a';
import CraftsmenB from '../craftsmen-b';
import styles from './index.module.scss';

export interface GameBoardProps {
	field: Field;
}

export default function GameBoard({ field }: GameBoardProps) {
	const rows = useMemo(() => {
		const rows = [];

		const hashedCraftsmen: {
			[y: number]: {
				[x: number]: CraftsmenPosition;
			};
		} = {};

		for (const craftsmen of field.craftsmen) {
			if (!hashedCraftsmen[craftsmen.y]) {
				hashedCraftsmen[craftsmen.y] = {};
			}

			hashedCraftsmen[craftsmen.y][craftsmen.x] = craftsmen;
		}

		const hashedCastle: { [y: number]: { [x: number]: Position } } = {};

		for (const castle of field.castles) {
			if (!hashedCastle[castle.y]) {
				hashedCastle[castle.y] = {};
			}

			hashedCastle[castle.y][castle.x] = castle;
		}

		const hashedPond: { [y: number]: { [x: number]: Position } } = {};

		for (const pond of field.ponds) {
			if (!hashedPond[pond.y]) {
				hashedPond[pond.y] = {};
			}

			hashedPond[pond.y][pond.x] = pond;
		}

		for (let i = 0; i < field.height; i++) {
			const cols = [];

			for (let j = 0; j < field.width; j++) {
				if (hashedCastle[i]?.[j]) {
					cols.push(
						<td>
							<Castle />
						</td>,
					);
					continue;
				}

				if (hashedCraftsmen[i]?.[j]) {
					const craftsmen = hashedCraftsmen[i][j];
					cols.push(
						<td>
							{craftsmen.side === 'A' ? (
								<CraftsmenA id={craftsmen.id} />
							) : (
								<CraftsmenB id={craftsmen.id} />
							)}
						</td>,
					);

					continue;
				}

				cols.push(
					<td
						className={clsx({
							[styles.pond]: hashedPond[i]?.[j],
						})}
					/>,
				);
			}

			rows.push(
				<tr>
					{cols.map((col, index) => (
						<React.Fragment key={index}>{col}</React.Fragment>
					))}
				</tr>,
			);
		}

		return rows;
	}, [field]);

	return (
		<table className={styles.wrapper}>
			<tbody>
				{rows.map((row, index) => (
					<React.Fragment key={index}>{row}</React.Fragment>
				))}
			</tbody>
		</table>
	);
}
