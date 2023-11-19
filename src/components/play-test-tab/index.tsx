/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager, { GameStateData } from '@/game/GameManager';
import Field from '@/models/Field';
import GameAction from '@/models/GameAction';
import playTest from '@/utils/playTest';
import randomField, { RandomFieldOptions } from '@/utils/randomField';
import { BugOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Col, InputNumber, Row, Space, message } from 'antd';
import FormItem from 'antd/es/form/FormItem';
import { Formik } from 'formik';
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
			<Formik initialValues={initialRandomFieldOptions} onSubmit={handleRandomField}>
				{({ values, handleSubmit, setFieldValue }) => (
					<form onSubmit={handleSubmit}>
						<Space direction='vertical' style={{ width: '100%' }}>
							<Row>
								<Col xs={12}>
									<FormItem label='Height'>
										<InputNumber
											placeholder='Width'
											name='width'
											value={values.width}
											onChange={(value) => setFieldValue('width', value)}
										/>
									</FormItem>
								</Col>

								<Col xs={12}>
									<FormItem label='Height'>
										<InputNumber
											placeholder='Height'
											name='height'
											value={values.height}
											onChange={(value) => setFieldValue('height', value)}
										/>
									</FormItem>
								</Col>

								<Col xs={24}>
									<FormItem label='Number of castles'>
										<InputNumber
											placeholder='Number of castles'
											name='numOfCastles'
											value={values.numOfCastles}
											onChange={(value) => setFieldValue('numOfCastles', value)}
										/>
									</FormItem>
								</Col>

								<Col xs={24}>
									<FormItem label='Number of craftsments'>
										<InputNumber
											placeholder='Number of craftsments'
											name='numOfCraftsmens'
											value={values.numOfCraftsmens}
											onChange={(value) => setFieldValue('numOfCraftsmens', value)}
										/>
									</FormItem>
								</Col>

								<Col xs={24}>
									<FormItem label='Number of ponds'>
										<InputNumber
											placeholder='Number of ponds'
											name='numOfPonds'
											value={values.numOfPonds}
											onChange={(value) => setFieldValue('numOfPonds', value)}
										/>
									</FormItem>
								</Col>
							</Row>
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
						</Space>
					</form>
				)}
			</Formik>

			{gameState && (
				<>
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
