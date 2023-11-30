import { EWallSide } from '@/game/enums/EWallSide';
import IGameStateData from '@/game/interfaces/IGameStateData';
import { Descriptions, Space } from 'antd';
import clsx from 'clsx';
import Chart from 'react-apexcharts';
import styles from './index.module.scss';
import { mainChartOptions, sideChartOptions } from './options';

export interface GameScoreProps {
	state: IGameStateData;
}

const sides: EWallSide[] = ['A', 'B'];

const colors = {
	A: '#06619e',
	B: '#009c15',
};

const keys = ['walls', 'territories', 'castles'];

export default function GameScore({ state }: GameScoreProps) {
	return (
		<Space style={{ width: '100%', position: 'sticky', top: 64 }} direction='vertical'>
			<div className={styles.scores}>
				{sides.map((side) => (
					<div key={side} className={clsx(styles.side, styles[side])}>
						<div className={styles.heading}>Đội {side}</div>
						<div className={styles.content}>
							<div className={styles.total}>{state.scores[side].total}</div>
							<Chart
								type='area'
								options={sideChartOptions}
								series={keys.map((key) => ({
									name: key,
									data: state.scoresHistory[side].map((score) => score[key as keyof typeof score]),
								}))}
							/>
							<Descriptions
								size='small'
								column={1}
								bordered
								items={[
									{ label: 'Tường', children: state.scores[side].walls },
									{
										label: 'Lãnh thổ',
										children: state.scores[side].territories,
									},
									{ label: 'Lâu đài', children: state.scores[side].castles },
								]}
							></Descriptions>
						</div>
					</div>
				))}
			</div>

			<Chart
				type='line'
				series={sides.map((side) => ({
					name: 'Đội ' + side,
					data: state.scoresHistory[side].map((score) => score.total),
					color: colors[side],
				}))}
				options={mainChartOptions}
			/>
		</Space>
	);
}
