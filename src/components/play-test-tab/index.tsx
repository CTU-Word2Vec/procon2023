/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager, { GameMode, GameStateData, gameModes } from '@/game/GameManager';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import playTest from '@/utils/playTest';
import randomField, { RandomFieldOptions } from '@/utils/randomField';
import { BugOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Form, InputNumber, Select, Space, message } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { useState } from 'react';
import ActionList from '../action-list';

export interface PlayRealTabProps {
	gameState?: GameStateData;
	onGameStateChange: (gameState: GameStateData) => void;
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
	const [sideAMode, setSideAMode] = useState<GameMode>('Caro');
	const [sideBMode, setSideBMode] = useState<GameMode>('Caro');

	const handleRandomField = (values: RandomFieldOptions) => {
		try {
			const field = randomField(values);
			setRandomedField(field);
			const gameManager = new GameManager(field);

			onGameStateChange(gameManager.getData());
		} catch (error: any) {
			message.error(error.message);
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
			<Form
				initialValues={initialRandomFieldOptions}
				labelAlign='left'
				labelCol={{ xs: 12 }}
				onFinish={handleRandomField}
				size='middle'
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
				<Button
					icon={<ThunderboltOutlined />}
					type='primary'
					danger
					style={{ width: '100%' }}
					htmlType='submit'
					disabled={isPlayingTest}
				>
					Random field
				</Button>
			</Form>

			{gameState && (
				<>
					<Divider />

					<Card title='Side A' size='small'>
						<Select
							placeholder='Select game mode'
							size='middle'
							style={{ width: '100%' }}
							options={gameModes.map((mode) => ({ label: mode, value: mode }))}
							value={sideAMode}
							onChange={setSideAMode}
						/>
					</Card>

					<Card title='Side B' size='small'>
						<Select
							placeholder='Select game mode'
							size='middle'
							style={{ width: '100%' }}
							options={gameModes.map((mode) => ({ label: mode, value: mode }))}
							value={sideBMode}
							onChange={setSideBMode}
						/>
					</Card>

					<Space style={{ width: '100%' }}>
						<InputNumber
							placeholder='Number of turns'
							value={numberOfTurns}
							onChange={(value) => setNumberOfTurns(value!)}
						/>
						<Button icon={<BugOutlined />} type='primary' loading={isPlayingTest} onClick={handlePlayTest}>
							Play test
						</Button>
					</Space>

					<ActionList actions={actions} />
				</>
			)}
		</Space>
	);
}
