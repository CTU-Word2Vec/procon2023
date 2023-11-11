import GameAction from '@/models/GameAction';
import { Alert, Descriptions, Typography } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import styles from './index.module.scss';

export interface ActionListProps {
	actions: GameAction[];
}
export default function ActionList({ actions }: ActionListProps) {
	return (
		<>
			<h3 style={{ marginTop: 10, fontWeight: 700 }}>Actions</h3>

			<div className={styles.wrapper}>
				{actions.map((action) => (
					<Alert
						key={action.id}
						type={action.turn % 2 === 0 ? 'info' : 'error'}
						message={
							<div>
								<Typography style={{ fontWeight: 700 }}>Turn {action.turn}</Typography>

								<Descriptions column={1} size='small' bordered>
									{action.actions.map((craftmen) => (
										<DescriptionsItem key={craftmen.craftsman_id} label={craftmen.craftsman_id}>
											<b>
												{craftmen.action} {craftmen.action !== 'STAY' && craftmen.action_param}
											</b>
										</DescriptionsItem>
									))}
								</Descriptions>
							</div>
						}
					></Alert>
				))}
			</div>
		</>
	);
}
