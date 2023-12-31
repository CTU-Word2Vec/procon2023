import GameAction from '@/models/GameAction';
import {
	ArrowRightOutlined,
	DoubleRightOutlined,
	FormatPainterFilled,
	StopOutlined,
	UserOutlined,
} from '@ant-design/icons';
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
							<div
								style={{
									display: 'flex',
									gap: 10,
								}}
							>
								<div
									style={{
										textDecoration: action.disabled ? 'line-through' : 'none',
										opacity: action.disabled ? 0.5 : 1,
										display: 'inline-block',
									}}
								>
									<strong>
										{iconMap[action.action]} {action.action}
									</strong>{' '}
									<span>{action.action_param}</span>
								</div>
								{action.disabled && (
									<strong>
										<ArrowRightOutlined /> STAY
									</strong>
								)}
							</div>
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
