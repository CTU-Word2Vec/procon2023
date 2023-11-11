import GameAction from '@/models/GameAction';
import { Alert, Descriptions, Timeline } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import styles from './index.module.scss';

export interface ActionListProps {
	actions: GameAction[];
}
export default function ActionList({ actions }: ActionListProps) {
	return (
		<>
			<h3 className={styles.title}>Actions</h3>

			<div className={styles.wrapper}>
				<Timeline>
					{actions.map((action) => (
						<Timeline.Item key={action.id} color={action.turn % 2 ? 'red' : 'blue'}>
							<Alert
								type={action.turn % 2 ? 'error' : 'info'}
								message={`Turn ${action.turn}`}
								description={
									<Descriptions column={1} size='small' bordered>
										{action.actions.map((craftmen) => (
											<DescriptionsItem key={craftmen.craftsman_id} label={craftmen.craftsman_id}>
												<b>
													{craftmen.action}{' '}
													{craftmen.action !== 'STAY' && craftmen.action_param}
												</b>
											</DescriptionsItem>
										))}
									</Descriptions>
								}
							></Alert>
						</Timeline.Item>
					))}
				</Timeline>
			</div>
		</>
	);
}
