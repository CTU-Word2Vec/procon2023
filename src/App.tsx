/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	AppstoreOutlined,
	PlayCircleOutlined,
	ReloadOutlined,
	SettingOutlined,
	ThunderboltOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { App as AntdApp, Button, Col, Divider, Input, Row, Select, Slider, Space, message } from 'antd';
import { useCallback, useState } from 'react';
import styles from './App.module.scss';
import ActionList from './components/action-list';
import AppHeader from './components/app-header';
import GameBoard from './components/game-board';
import GameInfo from './components/game-info';
import GameSettings from './components/game-settings';
import GameState, { GameMode, GameStateData, gameModes } from './game/GameManager';
import { EWallSide } from './game/WallPosition';
import Action from './models/Action';
import Game from './models/Game';
import GameAction from './models/GameAction';
import playerService from './services/player.service';
import wait from './utils/wait';

function App() {
	const [gameId, setGameId] = useState<string>();
	const [game, setGame] = useState<Game>();
	const [side, setSide] = useState<EWallSide>('A');
	const [isLoadingGame, setIsLoadingGame] = useState(false);
	const [gameState, setGameState] = useState<GameStateData>();
	const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
	const [gameActions, setGameActions] = useState<GameAction[]>([]);
	const [isPlaying, setIsPlaying] = useState(false);
	const [gameMode, setGameMode] = useState<GameMode>('Caro');
	const [isReplaying, setIsReplaying] = useState(false);

	const handleGetGameData = async () => {
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

	const handlePlayTest = useCallback(
		async (game: Game) => {
			try {
				setIsPlaying(true);

				const actions: GameAction[] = [];

				const gameState = new GameState(game.field);

				for (let i = 1; i <= game.num_of_turns; i++) {
					const turnOf: EWallSide = i % 2 !== 0 ? 'A' : 'B';

					const action = gameState.getNextActions(turnOf) as unknown as Action[];

					actions.push({
						actions: action,
						turn: i + 1,
						created_time: new Date().toISOString(),
						game_id: game.id,
						id: i,
						team_id: i % 2,
					});

					gameState.addActions(actions);
					setGameState(gameState.getData());
					setGameActions(actions.reverse());
					await wait(10);
				}
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsPlaying(false);
			}
		},
		[setGameState, setGameActions],
	);

	const handlePlay = useCallback(
		async (game: Game, side: EWallSide) => {
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
								actions: gameState.getNextActions(side),
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
		},
		[setIsPlaying, setGameState, setGameActions],
	);

	const handleReplay = useCallback(async () => {
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
	}, [game, gameId, setGameState]);

	return (
		<AntdApp>
			<AppHeader />
			<Row>
				<Col xs={24} md={12} lg={18}>
					<div className={styles.gameBoard}>
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

				<Col xs={24} md={12} lg={6} style={{ padding: 10 }}>
					<form
						onSubmit={(event) => {
							event.preventDefault();
							handleGetGameData();
						}}
					>
						<Space.Compact style={{ width: '100%' }}>
							<Button onClick={() => setIsOpenSettingModal(true)}>
								<SettingOutlined />
							</Button>

							<Input
								placeholder='Game Id'
								value={gameId}
								autoFocus
								onChange={(event) => setGameId(event.target.value)}
							/>
						</Space.Compact>

						<Space.Compact style={{ width: '100%', marginTop: 10 }}>
							{game && (
								<Button icon={<ReloadOutlined />} loading={isReplaying} onClick={handleReplay}>
									Replay
								</Button>
							)}

							<Button
								icon={<AppstoreOutlined />}
								type='primary'
								disabled={!gameId}
								loading={isLoadingGame}
								htmlType='submit'
								style={{ flex: 1 }}
							>
								Get game data
							</Button>
						</Space.Compact>
					</form>

					<Divider />

					{game && (
						<Space direction='vertical' style={{ width: '100%' }}>
							<Space>
								<Select
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
									value={gameMode}
									onChange={(value) => setGameMode(value)}
								/>
							</Space>

							<Space style={{ width: '100%' }}>
								<Button
									icon={<PlayCircleOutlined />}
									type='primary'
									loading={isPlaying}
									onClick={() => handlePlay(game, side)}
								>
									{isPlaying ? 'Playing...' : 'Play'}
								</Button>

								<Button
									icon={<ThunderboltOutlined />}
									loading={isPlaying}
									onClick={() => handlePlayTest(game)}
								>
									{isPlaying ? 'Playing...' : 'Play test'}
								</Button>
							</Space>

							<GameInfo game={game} currentTurn={gameState?.lastTurn} />

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
