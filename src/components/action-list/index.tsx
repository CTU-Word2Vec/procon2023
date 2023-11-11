import GameAction from '@/models/GameAction';
import { Alert, Descriptions, Typography } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';

export interface ActionListProps {
	actions: GameAction[];
}
export default function ActionList({ actions }: ActionListProps) {
	return (
		<>
			<h3 style={{ marginTop: 10, fontWeight: 700 }}>Actions</h3>

			<div
				style={{
					height: 400,
					overflow: 'auto',
					border: '1px solid #ddd',
					display: 'flex',
					flexDirection: 'column',
					gap: 5,
					marginTop: 10,
					padding: 10,
				}}
			>
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
