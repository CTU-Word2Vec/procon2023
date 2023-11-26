import { ICraftsmenPosition } from '@/game/interfaces';
import IGameStateData from '@/game/interfaces/IGameStateData';
import Action from '@/models/Action';
import GameAction from '@/models/GameAction';
import {
	ArrowDownOutlined,
	ArrowLeftOutlined,
	ArrowRightOutlined,
	ArrowUpOutlined,
	DoubleRightOutlined,
	FormatPainterFilled,
	StopOutlined,
	UserOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';
import React, { useMemo, useState } from 'react';
import Castle from '../castle';
import CraftsmenA from '../craftsmen-a';
import CraftsmenB from '../craftsmen-b';
import styles from './index.module.scss';

const iconMap = {
	STAY: <UserOutlined />,
	DESTROY: <StopOutlined />,
	BUILD: <FormatPainterFilled />,
	MOVE: <DoubleRightOutlined />,
};

const actionParamMap = {
	UP: <ArrowUpOutlined />,
	DOWN: <ArrowDownOutlined />,
	LEFT: <ArrowLeftOutlined />,
	RIGHT: <ArrowRightOutlined />,
	ABOVE: <ArrowUpOutlined />,
	BELOW: <ArrowDownOutlined />,
	UPPER_LEFT: (
		<ArrowUpOutlined
			style={{
				transform: 'rotate(-45deg)',
			}}
		/>
	),
	UPPER_RIGHT: (
		<ArrowUpOutlined
			style={{
				transform: 'rotate(-45deg)',
			}}
		/>
	),
	LOWER_LEFT: (
		<ArrowUpOutlined
			style={{
				transform: 'rotate(-135deg)',
			}}
		/>
	),
	LOWER_RIGHT: (
		<ArrowUpOutlined
			style={{
				transform: 'rotate(135deg)',
			}}
		/>
	),
};

export interface GameBoardProps {
	state: IGameStateData;
	action?: GameAction | null;
}

function renderCraftsmen(craftmen: ICraftsmenPosition) {
	if (craftmen.side === 'A') return <CraftsmenA />;

	return <CraftsmenB />;
}

interface MapProps {
	width: number;
	height: number;
}

function Map({ width, height }: MapProps) {
	const rows = useMemo(() => {
		const rows = [];

		for (let y = 0; y < height; y++) {
			const cols = [];

			for (let x = 0; x < width; x++) {
				cols.push(
					<td key={x}>
						<div className={styles.placeholder}></div>
					</td>,
				);
			}

			rows.push(
				<tr key={y}>
					{cols.map((col, index) => (
						<React.Fragment key={index}>{col}</React.Fragment>
					))}
				</tr>,
			);
		}

		return rows;
	}, [width, height]);

	return (
		<table>
			<tbody>
				{rows.map((row, index) => (
					<React.Fragment key={index}>{row}</React.Fragment>
				))}
			</tbody>
		</table>
	);
}

export default function GameBoard({ state, action }: GameBoardProps) {
	const [startX, setStartX] = useState(0);
	const [startY, setStartY] = useState(0);
	const [translateX, setTranslateX] = useState(0);
	const [translateY, setTranslateY] = useState(0);

	// Hashed actions
	const hashedActions = useMemo(() => {
		// If action is empty, return a empty object
		if (!action) return {};

		const hashed: {
			[id: string]: Action | null;
		} = {};
		for (const act of action.actions) {
			hashed[act.craftsman_id] = act;
		}

		return hashed;
	}, [action]);

	return (
		<div className={clsx(styles.wrapper, styles[state.lastTurn % 2 ? 'B' : 'A'])}>
			<div
				className={styles.inner}
				style={{
					transform: `translate(${translateX}px, ${translateY}px)`,
				}}
			>
				<Map width={state.width} height={state.height} />

				{state.ponds.map((pond, index) => (
					<div
						key={index}
						className={clsx(styles.position, styles.pond)}
						style={{
							transform: `translate(${pond.x * 33 + 1}px, ${pond.y * 33 + 1}px)`,
							zIndex: pond.y,
						}}
					></div>
				))}

				{state.sides.map((side, index) => (
					<div
						className={clsx(styles.position, styles.side, styles[side.data])}
						key={index}
						style={{
							transform: `translate(${side.x * 33 + 1}px, ${side.y * 33 + 1}px)`,
						}}
					>
						{side.data}
					</div>
				))}

				{state.walls.map((wall, index) => (
					<div
						key={index}
						className={clsx(styles.position)}
						style={{
							transform: `translate(${wall.x * 33 + 1}px, ${wall.y * 33 + 1}px)`,
							zIndex: wall.y,
						}}
					>
						<div className={clsx(styles.wall, styles[wall.side])}></div>
					</div>
				))}

				{state.castles.map((castle, index) => (
					<div
						key={index}
						className={styles.position}
						style={{
							transform: `translate(${castle.x * 33 + 1}px, ${castle.y * 33 + 1}px)`,
							zIndex: castle.y,
						}}
					>
						<Castle />
					</div>
				))}

				{state.craftsmen.map((craftsmen) => {
					const action = hashedActions[craftsmen.id];

					return (
						<div
							className={clsx(styles.craftsmen, styles[craftsmen.side])}
							style={{
								transform: `translate(${craftsmen.x * 33}px, ${craftsmen.y * 33}px)`,
								zIndex: craftsmen.y + 1,
							}}
							key={craftsmen.id}
						>
							<div
								className={clsx(styles.actionTooltip, styles[craftsmen.side], {
									[styles.show]: !!action,
								})}
							>
								<div>{iconMap[action?.action as keyof typeof iconMap]}</div>
								{action?.action_param && (
									<div>{actionParamMap[action?.action_param as keyof typeof actionParamMap]}</div>
								)}
							</div>
							{renderCraftsmen(craftsmen)}

							<div className={styles.id}>{craftsmen.id}</div>
						</div>
					);
				})}
				<div
					className={styles.mask}
					style={{ zIndex: state.height }}
					draggable
					onDragStart={(event) => {
						setStartX(event.clientX - translateX);
						setStartY(event.clientY - translateY);
					}}
					onDrag={(event) => {
						setTranslateX(event.clientX - startX);
						setTranslateY(event.clientY - startY);
					}}
					onDragEnd={(event) => {
						setTranslateX(event.clientX - startX);
						setTranslateY(event.clientY - startY);
					}}
				></div>
			</div>
		</div>
	);
}
