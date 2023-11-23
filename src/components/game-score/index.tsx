import { GameStateData } from '@/game';
import { Descriptions, Space } from 'antd';
import clsx from 'clsx';
import styles from './index.module.scss';

export interface GameScoreProps {
	state: GameStateData;
}
export default function GameScore({ state }: GameScoreProps) {
	return (
		<Space style={{ width: '100%' }} direction='vertical'>
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
		</Space>
	);
}
