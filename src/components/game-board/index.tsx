import { CraftsmenPosition } from '@/game/CraftsmenPosition';
import { GameStateData } from '@/game/GameManager';
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
				cols.push(
					<td>
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
	}, [state.width, state.height]);

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

				{state.walls.map((wall, index) => (
					<div
						key={index}
						className={clsx(styles.position, styles.wall, styles[wall.side])}
						style={{
							transform: `translate(${wall.x * 33 + 1}px, ${wall.y * 33 + 1}px)`,
						}}
					></div>
				))}

				{state.castles.map((castle, index) => (
					<div
						key={index}
						className={styles.position}
						style={{
							transform: `translate(${castle.x * 33 + 1}px, ${castle.y * 33 + 1}px)`,
						}}
					>
						<Castle />
					</div>
				))}

				{state.ponds.map((pond, index) => (
					<div
						key={index}
						className={clsx(styles.position, styles.pond)}
						style={{
							transform: `translate(${pond.x * 33 + 1}px, ${pond.y * 33 + 1}px)`,
						}}
					></div>
				))}

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
