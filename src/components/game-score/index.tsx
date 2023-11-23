import IGameStateData from '@/game/IGameStateData';
import { Descriptions, Space } from 'antd';
import clsx from 'clsx';
import Chart from 'react-apexcharts';
import styles from './index.module.scss';

export interface GameScoreProps {
	state: IGameStateData;
}
export default function GameScore({ state }: GameScoreProps) {
	return (
		<Space style={{ width: '100%', position: 'sticky', top: 64 }} direction='vertical'>
			<div className={styles.scores}>
				<div className={clsx(styles.side, styles.A)}>
					<div className={styles.heading}>Team A</div>
					<div className={styles.content}>
						<div className={styles.total}>{state.scores['A'].total}</div>
						<Descriptions
							size='small'
							column={1}
							bordered
							items={[
								{ label: 'Walls', children: state.scores['A'].walls },
								{
									label: 'Territories',
									children: state.scores['A'].territories,
								},
								{ label: 'Castles', children: state.scores['A'].castles },
							]}
						></Descriptions>
					</div>
				</div>

				<div className={clsx(styles.side, styles.B)}>
					<div className={styles.heading}>Team B</div>
					<div className={styles.content}>
						<div className={styles.total}>{state.scores['B'].total}</div>
						<Descriptions
							size='small'
							column={1}
							bordered
							items={[
								{ label: 'Walls', children: state.scores['B'].walls },
								{
									label: 'Territories',
									children: state.scores['B'].territories,
								},
								{ label: 'Castles', children: state.scores['B'].castles },
							]}
						></Descriptions>
					</div>
				</div>
			</div>

			<Chart
				type='line'
				series={[
					{
						name: 'Side A',
						data: state.scoresHistory['A'].map((score) => score.total),
					},
					{
						name: 'Side B',
						data: state.scoresHistory['B'].map((score) => score.total),
					},
				]}
				options={{
					stroke: {
						curve: 'smooth',
						width: 2,
						colors: ['#06619e', '#009c15'],
					},
					chart: {
						toolbar: {
							show: false,
						},
						height: 400,
						zoom: { enabled: false },
						animations: {
							enabled: true,
							easing: 'linear',
							dynamicAnimation: {
								speed: 1000,
							},
						},
					},
					xaxis: {
						labels: {
							show: false,
						},
					},
					dataLabels: {
						enabled: false,
					},
				}}
			/>
		</Space>
	);
}
