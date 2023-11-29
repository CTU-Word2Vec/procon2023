/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager from '@/game/classes/GameManager';
import { EGameMode, gameModes } from '@/game/enums/EGameMode';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import { RootState } from '@/store';
import { setCurrentAction, setGameState } from '@/store/gameState';
import playTest, { playTestState } from '@/utils/playTest';
import { RandomFieldOptions } from '@/utils/randomField';
import { BugOutlined, PauseOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Descriptions, Empty, Form, InputNumber, Progress, Select, Space, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import FormItem from 'antd/es/form/FormItem';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActionList from '../action-list';

export interface PlayRealTabProps {}

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

export default function PlayTestTab() {
	const [actions, setActions] = useState<GameAction[]>([]);
	const [isPlayingTest, setIsPlayingTest] = useState(false);
	const [randomedField, setRandomedField] = useState<Field>();
	const [numberOfTurns, setNumberOfTurns] = useState(100);
	const [sideAMode, setSideAMode] = useState<EGameMode>('Dijktra');
	const [sideBMode, setSideBMode] = useState<EGameMode>('Border');
	const [isRandoming, setIsRandoming] = useState(false);

	const gameState = useSelector((state: RootState) => state.gameState.gameState);
	const dispatch = useDispatch();

	const handleRandomField = useCallback(
		(values: RandomFieldOptions) => {
			try {
				setIsRandoming(true);
				const gameManager = GameManager.randomGame(values);
				setRandomedField(gameManager.toObject());

				dispatch(setGameState(gameManager.toObject()));

				// Set current action to undefined
				dispatch(setCurrentAction(undefined));
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsRandoming(false);
			}
		},
		[dispatch],
	);

	const handlePlayTest = useCallback(async () => {
		try {
			setIsPlayingTest(true);
			await playTest({
				numberOfTurns,
				field: randomedField!,
				sideAMode,
				sideBMode,
				onGameStateChange: (gameState) => dispatch(setGameState(gameState)),
				onGameActionsChange: (actions) => {
					setActions(actions);

					dispatch(setCurrentAction({ ...actions[actions.length - 1] }));
				},
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsPlayingTest(false);
			dispatch(setCurrentAction(undefined));
		}
	}, [dispatch, numberOfTurns, randomedField, sideAMode, sideBMode]);

	const stopPlayTest = () => {
		playTestState.playing = false;
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
								size='middle'
								disabled={isRandoming}
								onFinish={handleRandomField}
							>
								<FormItem label='Chiều rộng' name='width'>
									<InputNumber placeholder='Chiều rộng' name='width' />
								</FormItem>

								<FormItem label='Chiều cao' name='height'>
									<InputNumber placeholder='Chiều cao' name='height' />
								</FormItem>

								<FormItem label='Số lâu đài' name='numOfCastles'>
									<InputNumber placeholder='Số lâu đài' name='numOfCastles' />
								</FormItem>

								<FormItem label='Số thợ xây' name='numOfCraftsmens'>
									<InputNumber placeholder='Số thợ xây' name='numOfCraftsmens' />
								</FormItem>

								<FormItem label='Số ao' name='numOfPonds'>
									<InputNumber placeholder='Số ao' />
								</FormItem>

								<FormItem label='Điểm cho lâu đài' name='castle_coeff'>
									<InputNumber placeholder='Điểm cho lâu đài' name='castle_coeff' />
								</FormItem>

								<FormItem label='Điểm cho lãnh thổ' name='territory_coeff'>
									<InputNumber placeholder='Điểm cho lãnh thổ' name='territory_coeff' />
								</FormItem>

								<FormItem label='Điểm cho tường' name='wall_coeff'>
									<InputNumber placeholder='Điểm cho tường' name='wall_coeff' />
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
					<Form component={Card} title='Chọn giải thủật'>
						<Form.Item label='Đội A'>
							<Select
								placeholder='Chọn giải thuật cho đội A'
								style={{ width: '100%' }}
								options={gameModes.map((mode) => ({ label: mode, value: mode }))}
								value={sideAMode}
								onChange={setSideAMode}
							/>
						</Form.Item>
						<Form.Item label='Đội B'>
							<Select
								placeholder='Chọn giải thuật cho đội B'
								style={{ width: '100%' }}
								options={gameModes.map((mode) => ({ label: mode, value: mode }))}
								value={sideBMode}
								onChange={setSideBMode}
							/>
						</Form.Item>

						<Space style={{ width: '100%' }}>
							<InputNumber
								placeholder='Tổng số lượt'
								value={numberOfTurns}
								onChange={(value) => setNumberOfTurns(value!)}
							/>

							<Button
								icon={<BugOutlined />}
								type='primary'
								loading={isPlayingTest}
								onClick={handlePlayTest}
							>
								{isPlayingTest ? 'Đang chạy thử...' : 'Chạy thử'}
							</Button>

							<Button
								icon={<PauseOutlined />}
								danger
								type='primary'
								disabled={!isPlayingTest}
								onClick={stopPlayTest}
							></Button>
						</Space>
					</Form>

					<Descriptions>
						<DescriptionsItem label='Lượt'>
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
				<Empty description='Tải game để hiện thị' style={{ margin: '20px 0' }} />
			)}
		</Space>
	);
}
