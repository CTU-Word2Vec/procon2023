import GameAction from '@/models/GameAction';
import { DoubleRightOutlined, FormatPainterFilled, StopOutlined, UserOutlined } from '@ant-design/icons';
import { Descriptions } from 'antd';
import clsx from 'clsx';
import CraftsmenA from '../craftsmen-a';
import CraftsmenB from '../craftsmen-b';
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

const craftmenMap = {
	A: <CraftsmenA noBorder noScale noShadow size={48} />,
	B: <CraftsmenB noBorder noScale noShadow size={48} />,
};

export default function ActionItem({ action }: ActionItemProps) {
	return (
		<div
			className={clsx(styles.item, styles[action.turn % 2 ? 'B' : 'A'], {
				[styles.disabled]: action.disabled,
			})}
		>
			<div className={styles.left}>
				<span className={styles.turn}>{action.turn}</span>

				<span className={styles.craftsmen}>{craftmenMap[action.turn % 2 ? 'B' : 'A']}</span>
			</div>
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
