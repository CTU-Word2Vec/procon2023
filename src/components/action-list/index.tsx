import GameAction from '@/models/GameAction';
import { Select } from 'antd';
import React, { useState } from 'react';
import ActionItem from './action-item';
import styles from './index.module.scss';

type ShowType = 'all' | 'A' | 'B';

export interface ActionListProps {
	actions: GameAction[];
}

export default function ActionList({ actions }: ActionListProps) {
	const [showType, setShowType] = useState<ShowType>('all');

	return (
		<>
			<h3 className={styles.title}>
				<span>Hành động</span>

				<Select
					options={[
						{ label: 'Tất cả', value: 'all' },
						{ label: 'Đội A', value: 'A' },
						{ label: 'Đội B', value: 'B' },
					]}
					defaultValue={'all'}
					style={{ width: 128 }}
					onChange={setShowType}
				/>
			</h3>

			<div className={styles.wrapper}>
				{actions.map((action) => {
					const side = action.turn % 2 ? 'B' : 'A';
					if (showType !== 'all' && showType !== side) {
						return <React.Fragment key={action.id} />;
					}

					return <ActionItem key={action.id} action={action} />;
				})}
			</div>
		</>
	);
}
