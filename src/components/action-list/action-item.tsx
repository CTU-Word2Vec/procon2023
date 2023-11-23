import GameAction from '@/models/GameAction';
import { Descriptions } from 'antd';
import clsx from 'clsx';
import styles from './index.module.scss';

export interface ActionItemProps {
	action: GameAction;
}

export default function ActionItem({ action }: ActionItemProps) {
	return (
		<div className={clsx(styles.item, styles[action.turn % 2 ? 'B' : 'A'])}>
			<span className={styles.turn}>{action.turn}</span>
			<div className={styles.content}>
				<Descriptions
					items={action.actions.map((e) => ({
						label: e.craftsman_id,
						children: <strong>{[e.action, e.action_param].join(' - ')}</strong>,
					}))}
					column={1}
					bordered
					size='small'
					colon={false}
					labelStyle={{ width: 128 }}
				/>
			</div>
		</div>
	);
}
