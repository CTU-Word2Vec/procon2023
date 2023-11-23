/* eslint-disable @typescript-eslint/no-explicit-any */
import { EGameMode, gameModes } from '@/game/EGameMode';
import GameManager from '@/game/GameManager';
import IGameStateData from '@/game/IGameStateData';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import playTest from '@/utils/playTest';
import randomField, { RandomFieldOptions } from '@/utils/randomField';
import { BugOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Descriptions, Empty, Form, InputNumber, Progress, Select, Space, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import FormItem from 'antd/es/form/FormItem';
import { useState } from 'react';
import ActionList from '../action-list';

export interface PlayRealTabProps {
	gameState?: IGameStateData;
	onGameStateChange: (gameState: IGameStateData) => void;
}

const initialRandomFieldOptions: RandomFieldOptions = {
	width: 20,
	height: 20,
	wall_coeff: 1,
	territory_coeff: 5,
	castle_coeff: 20,
	numOfCastles: 5,
	numOfCraftsmens: 5,
	numOfPonds: 5,
};

export default function PlayTestTab({ gameState, onGameStateChange }: PlayRealTabProps) {
	const [actions, setActions] = useState<GameAction[]>([]);
	const [isPlayingTest, setIsPlayingTest] = useState(false);
	const [randomedField, setRandomedField] = useState<Field>();
	const [numberOfTurns, setNumberOfTurns] = useState(100);
	const [sideAMode, setSideAMode] = useState<EGameMode>('Caro');
	const [sideBMode, setSideBMode] = useState<EGameMode>('Caro');
	const [isRandoming, setIsRandoming] = useState(false);

	const handleRandomField = (values: RandomFieldOptions) => {
		try {
			setIsRandoming(true);
			const field = randomField(values);
			setRandomedField(field);
			const gameManager = new GameManager(field);

			onGameStateChange(gameManager.getData());
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsRandoming(false);
		}
	};

	const handlePlayTest = () => {
		setIsPlayingTest(true);
		playTest({
			numberOfTurns,
			field: randomedField!,
			onGameStateChange,
			onGameActionsChange: setActions,
		}).then(() => setIsPlayingTest(false));
	};

	return (
		<Space style={{ width: '100%' }} direction='vertical'>
			<Collapse
				size='middle'
				defaultActiveKey={['random-field']}
				items={[
					{
						label: 'Random field',
						key: 'random-field',
						children: (
							<Form
								initialValues={initialRandomFieldOptions}
								labelAlign='left'
								labelCol={{ xs: 12 }}
								onFinish={handleRandomField}
								size='middle'
								disabled={isRandoming}
							>
								<FormItem label='Width' name='width'>
									<InputNumber placeholder='Width' name='width' />
								</FormItem>

								<FormItem label='Height' name='height'>
									<InputNumber placeholder='Height' name='height' />
								</FormItem>

								<FormItem label='Number of castles' name='numOfCastles'>
									<InputNumber placeholder='Number of castles' name='numOfCastles' />
								</FormItem>

								<FormItem label='Number of craftsments' name='numOfCraftsmens'>
									<InputNumber placeholder='Number of craftsments' name='numOfCraftsmens' />
								</FormItem>

								<FormItem label='Number of ponds' name='numOfPonds'>
									<InputNumber placeholder='Number of ponds' />
								</FormItem>

								<FormItem label='Coeff of castles' name='castle_coeff'>
									<InputNumber placeholder='Coeff of castles' name='castle_coeff' />
								</FormItem>

								<FormItem label='Coeff of territory' name='territory_coeff'>
									<InputNumber placeholder='Coeff of territory' name='territory_coeff' />
								</FormItem>

								<FormItem label='Coeff of wall' name='wall_coeff'>
									<InputNumber placeholder='Coeff of wall' name='wall_coeff' />
								</FormItem>

								<Button
									icon={<ThunderboltOutlined />}
									type='primary'
									style={{ width: '100%', background: 'green' }}
									htmlType='submit'
									disabled={isPlayingTest}
									size='large'
								>
									Random field
								</Button>
							</Form>
						),
					},
				]}
			></Collapse>

			{randomedField && gameState ? (
				<>
					<Form component={Card} title='Select algorithms' disabled={isPlayingTest}>
						<Form.Item label='Side A'>
							<Select
								placeholder='Select game mode'
								style={{ width: '100%' }}
								options={gameModes.map((mode) => ({ label: mode, value: mode }))}
								value={sideAMode}
								onChange={setSideAMode}
							/>
						</Form.Item>
						<Form.Item label='Side B'>
							<Select
								placeholder='Select game mode'
								style={{ width: '100%' }}
								options={gameModes.map((mode) => ({ label: mode, value: mode }))}
								value={sideBMode}
								onChange={setSideBMode}
							/>
						</Form.Item>

						<Space style={{ width: '100%' }}>
							<InputNumber
								placeholder='Number of turns'
								value={numberOfTurns}
								onChange={(value) => setNumberOfTurns(value!)}
							/>
							<Button
								icon={<BugOutlined />}
								type='primary'
								loading={isPlayingTest}
								onClick={handlePlayTest}
							>
								{isPlayingTest ? 'Playing test...' : 'Play test'}
							</Button>
						</Space>
					</Form>

					<Descriptions>
						<DescriptionsItem label='Turn'>
							<Progress
								percent={(gameState.lastTurn / numberOfTurns) * 100}
								showInfo
								format={(number) => ((number! * numberOfTurns) / 100).toFixed(0)}
							/>
						</DescriptionsItem>
					</Descriptions>

					<ActionList actions={actions} />
				</>
			) : (
				<Empty description='Please random field to play game' />
			)}
		</Space>
	);
}
