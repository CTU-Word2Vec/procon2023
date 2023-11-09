/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlayCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Col, Descriptions, Divider, Input, Modal, Row, Select, Space, message } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import ActionList from './components/action-list';
import GameBoard from './components/game-board';
import Game from './models/Game';
import GameAction from './models/GameAction';
import playerService from './services/player.service';
import tokenService from './services/token.service';
import GameState, { GameStateData } from './states/GameState';
import randomAction from './utils/randomAction';
import wait from './utils/wait';

function App() {
	const [gameId, setGameId] = useState<string>();
	const [game, setGame] = useState<Game>();
	const [side, setSide] = useState<'A' | 'B'>('A');
	const [isLoadingGame, setIsLoadingGame] = useState(false);
	const [gameState, setGameState] = useState<GameStateData>();
	const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
	const [gameActions, setGameActions] = useState<GameAction[]>([]);

	const handleStart = async () => {
		if (!gameId) return;
		try {
			setIsLoadingGame(true);
			const game = await playerService.getGameById(+gameId);
			const actions = await playerService.getGameActions(+gameId);

			const gameState = new GameState(game.field);

			gameState.addActions(actions);

			setGameState(gameState.getData());
			setGameActions(actions.reverse());
			setGame(game);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsLoadingGame(false);
		}
	};

	const craftmens = useMemo(() => {
		return game?.field.craftsmen.filter((craftmen) => craftmen.side === side) || [];
	}, [side, game]);

	const handlePlay = async () => {
		if (!game) return;

		try {
			const now = new Date();
			const startTime = new Date(game.start_time);

			let nextTurn = side === 'A' ? 2 : 1;

			if (now.getTime() >= startTime.getTime()) {
				const { cur_turn } = await playerService.getGameStatus(game.id);

				nextTurn = cur_turn;

				if (side === 'A' && nextTurn % 2 !== 0) {
					nextTurn++;
				}
			} else {
				await wait(Math.max(0, startTime.getTime() - now.getTime()));
			}

			const gameState = new GameState(game.field);

			const actions = await playerService.getGameActions(game.id);

			gameState.addActions(actions);

			setGameState(gameState.getData());

			for (let i = nextTurn; i <= game.num_of_turns; i++) {
				const { cur_turn } = await playerService.getGameStatus(game.id);

				if ((side === 'A' && cur_turn % 2 !== 0) || (side === 'B' && cur_turn % 2 === 0)) {
					try {
						await playerService.createAction(game.id, {
							turn: cur_turn + 1,
							actions: craftmens.map((e) => randomAction(e.id)),
						});
					} catch (error: any) {
						message.error(error.message);
					}
				}

				const actions = await playerService.getGameActions(game.id);

				gameState.addActions(actions);
				setGameState(gameState.getData());
				setGameActions(actions.reverse());

				const { remaining } = await playerService.getGameStatus(game.id);

				await wait(remaining * 1000);
			}
		} catch (error: any) {
			message.error(error.message);
		}
	};

	return (
		<>
			<Row>
				<Col xs={12}>
					<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 64 }}>
						{gameState && <GameBoard state={gameState as GameStateData} />}
					</div>
				</Col>

				<Col xs={12} style={{ padding: 10 }}>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleStart();
						}}
					>
						<Space.Compact style={{ width: '100%' }}>
							<Input
								placeholder='Game Id'
								value={gameId}
								onChange={(event) => setGameId(event.target.value)}
							/>
							<Button
								icon={<PlayCircleOutlined />}
								type='primary'
								disabled={!gameId}
								loading={isLoadingGame}
								htmlType='submit'
							>
								Get game data
							</Button>
						</Space.Compact>

						<ButtonGroup style={{ marginTop: 10 }}>
							<Button shape='circle' onClick={() => setIsOpenSettingModal(true)}>
								<SettingOutlined />
							</Button>
						</ButtonGroup>
					</form>

					<Divider />

					{game && (
						<>
							<Select
								style={{ width: '100%' }}
								placeholder='Side'
								value={side}
								onChange={setSide}
								options={game.sides.map((e) => ({
									value: e.side,
									label: `Side ${e.side} - ${e.team_name}`,
								}))}
							/>

							<Descriptions bordered style={{ marginTop: 10 }} column={2}>
								<DescriptionsItem label='Game Id'>{game.id}</DescriptionsItem>
								<DescriptionsItem label='Dimension'>
									{game.field.width}x{game.field.height}
								</DescriptionsItem>
								<DescriptionsItem label='Time per turn'>{game.time_per_turn} secs</DescriptionsItem>
								<DescriptionsItem label='Number of turns'>{game.num_of_turns}</DescriptionsItem>
								<DescriptionsItem label='Start time'>
									{dayjs(game.start_time).format('DD/MM/YYYY HH:mm:ss')}
								</DescriptionsItem>
							</Descriptions>

							<Button
								style={{ marginTop: 10 }}
								icon={<PlayCircleOutlined />}
								type='primary'
								onClick={handlePlay}
							>
								Play
							</Button>
						</>
					)}

					<ActionList actions={gameActions} />
				</Col>
			</Row>

			<Modal
				title='Setting'
				open={isOpenSettingModal}
				onCancel={() => setIsOpenSettingModal(false)}
				onOk={() => setIsOpenSettingModal(false)}
			>
				<Input
					placeholder='Token'
					value={tokenService.token}
					onChange={(event) => (tokenService.token = event.target.value)}
				/>
			</Modal>
		</>
	);
}

export default App;
