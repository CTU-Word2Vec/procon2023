import { CraftsmenPosition } from '@/game/CraftsmenPosition';
import { GameStateData } from '@/game/GameManager';
import { Position } from '@/game/Position';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import Castle from '../castle';
import CraftsmenA from '../craftsmen-a';
import CraftsmenB from '../craftsmen-b';
import styles from './index.module.scss';

export interface GameBoardProps {
	state: GameStateData;
}

function renderCraftsmen(craftmen: CraftsmenPosition) {
	if (craftmen.side === 'A') return <CraftsmenA id={craftmen.id} />;

	return <CraftsmenB id={craftmen.id} />;
}

export default function GameBoard({ state }: GameBoardProps) {
	const rows = useMemo(() => {
		const rows = [];

		for (let y = 0; y < state.height; y++) {
			const cols = [];

			for (let x = 0; x < state.width; x++) {
				const pos = new Position(x, y);

				const className = clsx({
					[styles.pond]: state.hashedPonds.exist(pos),
					[styles.wallA]: state.hashedWalls.read(pos)?.side == 'A',
					[styles.wallB]: state.hashedWalls.read(pos)?.side == 'B',
				});

				if (state.hashedCastles.exist(pos)) {
					cols.push(
						<td className={className}>
							<Castle />
						</td>,
					);
					continue;
				}

				cols.push(
					<td className={className}>
						<div className={styles.placeholder}></div>
					</td>,
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
	}, [state]);

	return (
		<div className={styles.wrapper}>
			<div className={styles.inner}>
				<table>
					<tbody>
						{rows.map((row, index) => (
							<React.Fragment key={index}>{row}</React.Fragment>
						))}
					</tbody>
				</table>

				{state.craftsmen.map((craftsmen) => (
					<div
						key={craftsmen.id}
						className={styles.flyingCraftsmen}
						style={{
							transform: `translate(${craftsmen.x * 33 + 1}px, ${craftsmen.y * 33 + 1}px)`,
						}}
					>
						{renderCraftsmen(craftsmen)}
					</div>
				))}
			</div>
		</div>
	);
}
