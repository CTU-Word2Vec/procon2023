import GameAction from '@/models/GameAction';
import { Alert, Descriptions, Timeline } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import { useEffect } from 'react';
import styles from './index.module.scss';

export interface ActionListProps {
	actions: GameAction[];
	turn?: number;
}
export default function ActionList({ actions, turn }: ActionListProps) {
	const id = 'turn';

	useEffect(() => {
		document.querySelector(`.${id}-${turn}`)?.scrollIntoView();
	}, [id, turn]);

	return (
		<>
			<h3 className={styles.title}>Actions</h3>

			<div className={styles.wrapper}>
				<Timeline
					items={actions.map((action) => {
						return {
							children: (
								<Alert
									type={action.turn % 2 ? 'error' : 'info'}
									message={`Turn ${action.turn}`}
									className={`${id}-${action.turn}`}
									description={
										<Descriptions column={1} size='small' bordered>
											{action.actions.map((craftmen) => (
												<DescriptionsItem
													key={craftmen.craftsman_id}
													label={craftmen.craftsman_id}
												>
													<b>
														{craftmen.action}{' '}
														{craftmen.action !== 'STAY' && craftmen.action_param}
													</b>
												</DescriptionsItem>
											))}
										</Descriptions>
									}
								></Alert>
							),
							color: action.turn % 2 ? 'red' : 'blue',
						};
					})}
				/>
			</div>
		</>
	);
}
