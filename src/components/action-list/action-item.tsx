import GameAction from '@/models/GameAction';
import { DoubleRightOutlined, FormatPainterFilled, StopOutlined, UserOutlined } from '@ant-design/icons';
import { Descriptions } from 'antd';
import clsx from 'clsx';
import styles from './index.module.scss';

const iconMap = {
	STAY: <UserOutlined />,
	DESTROY: <StopOutlined />,
	BUILD: <FormatPainterFilled />,
	MOVE: <DoubleRightOutlined />,
};

export interface ActionItemProps {
	action: GameAction;
}

export default function ActionItem({ action }: ActionItemProps) {
	return (
		<div
			className={clsx(styles.item, styles[action.turn % 2 ? 'B' : 'A'], {
				[styles.disabled]: action.disabled,
			})}
		>
			<span className={styles.turn}>{action.turn}</span>
			<div className={styles.content}>
				<Descriptions
					items={action.actions.map((action) => ({
						label: action.craftsman_id,
						children: (
							<>
								<strong>
									{iconMap[action.action]} {action.action}
								</strong>{' '}
								{action.action_param}
							</>
						),
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
