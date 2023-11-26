/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager from '@/game/classes/GameManager';
import { EGameMode, gameModes } from '@/game/enums/EGameMode';
import { EWallSide } from '@/game/enums/EWallSide';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService from '@/services/player.service';
import { RootState } from '@/store';
import { setCurrentAction, setGameState } from '@/store/gameState';
import playReal from '@/utils/playReal';
import replay from '@/utils/replay';
import { PlayCircleOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Descriptions, Empty, Input, Select, Space, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActionList from '../action-list';
import CountDown from '../count-down';
import GameInfo from '../game-info';

export interface PlayRealTabProps {}

export default function PlayRealTab() {
	const [gameId, setGameId] = useState('');
	const [game, setGame] = useState<Game>();

	const [side, setSide] = useState<EWallSide>('A');
	const [gameMode, setGameMode] = useState<EGameMode>('Caro');

	const [currentGameActions, setCurrentGameActions] = useState<GameAction[]>([]);
	const [baseGameActions, setBaseGameActions] = useState<GameAction[]>([]);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isReplaying, setIsReplaying] = useState(false);
	const [isLoadingGame, setIsLoadingGame] = useState(false);

	const [messageApi, contextHolder] = message.useMessage();

	const gameState = useSelector((state: RootState) => state.gameState.gameState);
	const dispatch = useDispatch();

	const handlePlayReal = async () => {
		try {
			setIsPlaying(true);
			await playReal({
				game: game!,
				side,
				onGameStateChange: (gameState) => dispatch(setGameState(gameState)),
				onGameActionsChange(actions) {
					setCurrentGameActions(actions);
					dispatch(setCurrentAction(actions[actions.length - 1]));
				},
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsPlaying(false);
			dispatch(setCurrentAction(undefined));
		}
	};

	const handleReplay = async () => {
		try {
			setIsReplaying(true);
			await replay({
				game: game!,
				actions: baseGameActions,
				onGameStateChange: (gameState) => dispatch(setGameState(gameState)),
				onActionsChange(actions) {
					setCurrentGameActions(actions);
					dispatch(setCurrentAction(actions[actions.length - 1]));
				},
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsReplaying(false);
			setCurrentAction(undefined);
		}
	};

	const handleGetGameData = async () => {
		const key = 'loadGameData';

		try {
			if (!gameId) {
				throw new Error('Please provide the id of game');
			}

			setCurrentAction(undefined);

			setIsLoadingGame(true);
			messageApi.open({
				key,
				content: 'Loading game data',
				type: 'loading',
				duration: 0,
			});

			const game = await playerService.getGameById(+gameId);
			const currentActions = await playerService.getGameActions(game.id);
			const baseActions = await playerService.getGameActions(game.id);

			const gameManager = new GameManager(game.field, game.num_of_turns);
			gameManager.addActions(currentActions);

			// Dispatch game state to redux
			dispatch(setGameState(gameManager.toObject()));
			setCurrentGameActions(currentActions);
			setBaseGameActions(baseActions);

			setGame(game);

			messageApi.open({
				key,
				content: `Loaded game data: ${game.name}`,
				duration: 2,
				type: 'success',
			});
		} catch (error: any) {
			messageApi.open({
				key,
				content: error.message,
				type: 'error',
				duration: 2,
			});
		} finally {
			setIsLoadingGame(false);
		}
	};

	return (
		<>
			{contextHolder}

			<form
				onSubmit={(event) => {
					event.preventDefault();
					handleGetGameData();
				}}
			>
				<Space.Compact style={{ width: '100%' }}>
					<Input
						placeholder='Game Id'
						value={gameId}
						autoFocus
						onChange={(event) => setGameId(event.target.value)}
					/>
					{game && (
						<Button icon={<ReloadOutlined />} loading={isReplaying} onClick={handleReplay}>
							Replay
						</Button>
					)}
					<Button
						icon={<SearchOutlined />}
						type='primary'
						loading={isLoadingGame}
						htmlType='submit'
						disabled={!gameId}
					>
						Load
					</Button>
				</Space.Compact>
			</form>

			{game ? (
				<Space direction='vertical' style={{ width: '100%', marginTop: 10 }}>
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
							options={gameModes.map((mode) => ({ value: mode, label: mode }))}
							placeholder='Game mode'
							value={gameMode}
							onChange={(value) => setGameMode(value)}
						/>

						<Button
							icon={<PlayCircleOutlined />}
							type='primary'
							loading={isPlaying}
							onClick={handlePlayReal}
						>
							{isPlaying ? 'Playing...' : 'Play'}
						</Button>
					</Space>

					{isPlaying && (
						<Descriptions bordered column={1}>
							<DescriptionsItem label='Count down'>
								<CountDown seconds={game.time_per_turn} />
							</DescriptionsItem>
						</Descriptions>
					)}

					<GameInfo game={game} currentTurn={gameState?.lastTurn} />

					<ActionList actions={currentGameActions} />
				</Space>
			) : (
				<Empty description='Get game data to play' style={{ margin: '20px 0' }} />
			)}
		</>
	);
}
