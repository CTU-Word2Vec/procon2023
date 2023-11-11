/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	InfoCircleOutlined,
	PlayCircleOutlined,
	ReloadOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { App as AntdApp, Button, Col, Descriptions, Divider, Input, Row, Select, Slider, Space, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { useState } from 'react';
import ActionList from './components/action-list';
import GameBoard from './components/game-board';
import GameSettings from './components/game-settings';
import GameState, { GameMode, GameStateData, gameModes } from './game/GameManager';
import Game from './models/Game';
import GameAction from './models/GameAction';
import playerService from './services/player.service';
import wait from './utils/wait';

function App() {
	const [gameId, setGameId] = useState<string>();
	const [game, setGame] = useState<Game>();
	const [side, setSide] = useState<'A' | 'B'>('A');
	const [isLoadingGame, setIsLoadingGame] = useState(false);
	const [gameState, setGameState] = useState<GameStateData>();
	const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
	const [gameActions, setGameActions] = useState<GameAction[]>([]);
	const [isPlaying, setIsPlaying] = useState(false);
	const [gameMode, setGameMode] = useState<GameMode>('Caro');
	const [isReplaying, setIsReplaying] = useState(false);

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

	const handlePlay = async () => {
		if (!game) return;

		try {
			setIsPlaying(true);

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

			for (let i = 0; i <= game.num_of_turns; i++) {
				const actions = await playerService.getGameActions(game.id);

				const { cur_turn } = await playerService.getGameStatus(game.id);

				gameState.addActions(actions);
				setGameState(gameState.getData());
				setGameActions(actions.reverse());

				if ((side === 'A' && cur_turn % 2 !== 0) || (side === 'B' && cur_turn % 2 === 0)) {
					playerService
						.createAction(game.id, {
							turn: cur_turn + 1,
							actions: gameState.caroGetActions(side),
						})
						.catch((error) => message.error(error.message));
				}

				const { remaining } = await playerService.getGameStatus(game.id);

				await wait(remaining * 1000);
			}
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsPlaying(false);
		}
	};

	const handleReplay = async () => {
		try {
			setIsReplaying(true);
			const actions = await playerService.getGameActions(+gameId!);

			const gameState = new GameState(game!.field!);

			for (let i = 0; i < actions.length; i++) {
				const action = actions[i];

				if (action.turn === actions[i + 1]?.turn) {
					continue;
				}

				gameState.addActions([action]);
				setGameState(gameState.getData());

				await wait(300);
			}
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsReplaying(false);
		}
	};

	return (
		<AntdApp>
			<Row>
				<Col xs={12}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							paddingTop: 64,
							flexDirection: 'column',
						}}
					>
						{gameState && (
							<>
								<GameBoard state={gameState as GameStateData} />
								<Slider
									value={gameState.lastTurn}
									style={{ width: 640 }}
									max={game?.num_of_turns || 0}
								/>
							</>
						)}
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
							<Button onClick={() => setIsOpenSettingModal(true)}>
								<SettingOutlined />
							</Button>

							<Input
								placeholder='Game Id'
								value={gameId}
								onChange={(event) => setGameId(event.target.value)}
							/>

							{game && (
								<Button icon={<ReloadOutlined />} loading={isReplaying} onClick={handleReplay}>
									Replay
								</Button>
							)}

							<Button
								icon={<InfoCircleOutlined />}
								type='primary'
								disabled={!gameId}
								loading={isLoadingGame}
								htmlType='submit'
							>
								Get game data
							</Button>
						</Space.Compact>
					</form>

					<Divider />

					{game && (
						<Space direction='vertical' style={{ width: '100%' }}>
							<Descriptions bordered column={2}>
								<DescriptionsItem label='Game Id'>{game.id}</DescriptionsItem>
								<DescriptionsItem label='Dimension'>
									{game.field.width}x{game.field.height}
								</DescriptionsItem>
								<DescriptionsItem label='Time per turn'>{game.time_per_turn} secs</DescriptionsItem>
								<DescriptionsItem label='Number of turns'>{game.num_of_turns}</DescriptionsItem>
								<DescriptionsItem label='Start time'>
									{dayjs(game.start_time).format('DD/MM/YYYY HH:mm:ss')}
								</DescriptionsItem>
								<DescriptionsItem label='Turn'>{gameState?.lastTurn}</DescriptionsItem>
							</Descriptions>

							<Space.Compact style={{ width: '100%' }}>
								<Button
									icon={<PlayCircleOutlined />}
									type='primary'
									loading={isPlaying}
									onClick={handlePlay}
								>
									{isPlaying ? 'Playing...' : 'Play'}
								</Button>

								<Select
									style={{ flex: 1 }}
									placeholder='Side'
									value={side}
									suffixIcon={<UserOutlined />}
									onChange={setSide}
									options={game.sides.map((e) => ({
										value: e.side,
										label: `Side ${e.side} - ${e.team_name}`,
									}))}
								/>

								<Select
									options={gameModes.map((e) => ({ value: e, label: e }))}
									placeholder='Game mode'
									style={{ flex: 1 }}
									value={gameMode}
									onChange={(value) => setGameMode(value)}
								/>
							</Space.Compact>

							<ActionList actions={gameActions} />
						</Space>
					)}
				</Col>
			</Row>

			<GameSettings open={isOpenSettingModal} onCancel={() => setIsOpenSettingModal(false)} />
		</AntdApp>
	);
}

export default App;
