import { EWallSide } from '@/game/enums/EWallSide';
import IGameStateData from '@/game/interfaces/IGameStateData';
import { Descriptions, Space } from 'antd';
import clsx from 'clsx';
import Chart from 'react-apexcharts';
import styles from './index.module.scss';

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
						<div className={styles.heading}>Team {side}</div>
						<div className={styles.content}>
							<div className={styles.total}>{state.scores[side].total}</div>
							<Chart
								type='area'
								options={{
									stroke: {
										curve: 'smooth',
										width: 2,
									},
									grid: { show: false },
									chart: {
										toolbar: {
											show: false,
										},
										height: 100,
										zoom: { enabled: false },
										animations: {
											enabled: true,
											easing: 'easeinout',
											dynamicAnimation: {
												speed: 1000,
											},
										},
										stacked: true,
									},
									xaxis: {
										labels: {
											show: false,
										},
										axisBorder: {
											show: false,
										},
										axisTicks: {
											show: false,
										},
									},
									yaxis: {
										labels: {
											show: false,
										},
									},
									dataLabels: {
										enabled: false,
									},
									legend: {
										show: false,
									},
								}}
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
									{ label: 'Walls', children: state.scores[side].walls },
									{
										label: 'Territories',
										children: state.scores[side].territories,
									},
									{ label: 'Castles', children: state.scores[side].castles },
								]}
							></Descriptions>
						</div>
					</div>
				))}
			</div>

			<Chart
				type='line'
				series={sides.map((side) => ({
					name: 'Side ' + side,
					data: state.scoresHistory[side].map((score) => score.total),
					color: colors[side],
				}))}
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
							easing: 'easeinout',
						},
					},
					xaxis: {
						labels: {
							show: false,
						},
					},
				}}
			/>
		</Space>
	);
}
