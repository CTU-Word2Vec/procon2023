/* eslint-disable @typescript-eslint/no-explicit-any */
import { Position } from '@/game/classes';
import GameManager from '@/game/classes/GameManager';
import { EGameMode, gameModes } from '@/game/enums/EGameMode';
import { EWallSide } from '@/game/enums/EWallSide';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService from '@/services/player.service';
import { RootState } from '@/store';
import { setCurrentAction, setGameState } from '@/store/gameState';
import { removePosition } from '@/store/willMoveTo';
import playReal, { playRealState } from '@/utils/playReal';
import replay, { replayState } from '@/utils/replay';
import { PauseOutlined, PlayCircleOutlined, ReloadOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Empty, Input, Select, Space, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActionList from '../action-list';
import CountDown from '../count-down';
import GameInfo from '../game-info';

export interface PlayRealTabProps {}

export default function PlayRealTab() {
	const [gameId, setGameId] = useState('');
	const [game, setGame] = useState<Game>();
	const [postErrorCount, setPostErrorCount] = useState(0);

	const [side, setSide] = useState<EWallSide>('A');
	const [gameMode, setGameMode] = useState<EGameMode>('Caro');

	const [currentGameActions, setCurrentGameActions] = useState<GameAction[]>([]);
	const [baseGameActions, setBaseGameActions] = useState<GameAction[]>([]);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isReplaying, setIsReplaying] = useState(false);
	const [isLoadingGame, setIsLoadingGame] = useState(false);
	const [isShowCountDown, setIsShowCountDown] = useState(false);

	const [waitTime, setWaitTime] = useState(0);

	const [messageApi, contextHolder] = message.useMessage();

	const gameState = useSelector((state: RootState) => state.gameState.gameState);
	const dispatch = useDispatch();

	const handlePlayReal = useCallback(async () => {
		try {
			setIsPlaying(true);
			setPostErrorCount(0);
			await playReal({
				game: game!,
				side,
				gameMode,
				onMoveFinished: (pos: Position) => {
					dispatch(removePosition(pos));
				},
				onWaitTimeChange: (time) => setWaitTime(time),
				onShowCountDownChange: (show) => setIsShowCountDown(show),
				onGameStateChange: (gameState) => dispatch(setGameState(gameState)),
				onGameActionsChange(actions) {
					setCurrentGameActions(actions);
					dispatch(setCurrentAction({ ...actions[actions.length - 1] }));
				},
				onPostError(error) {
					message.error(error.message);
					setPostErrorCount((prev) => prev + 1);
				},
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsPlaying(false);
			setIsShowCountDown(false);
			dispatch(setCurrentAction(undefined));
		}
	}, [dispatch, game, side, gameMode]);

	const handleReplay = useCallback(async () => {
		try {
			setIsReplaying(true);
			await replay({
				game: game!,
				actions: baseGameActions,
				onGameStateChange: (gameState) => dispatch(setGameState(gameState)),
				onActionsChange(actions) {
					setCurrentGameActions([...actions]);
					dispatch(setCurrentAction({ ...actions[actions.length - 1] }));
				},
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsReplaying(false);
			setCurrentAction(undefined);
		}
	}, [dispatch, game, baseGameActions]);

	const handleGetGameData = useCallback(async () => {
		const key = 'loadGameData';

		try {
			if (!gameId) {
				throw new Error('Vui lòng nhập id game');
			}

			setCurrentAction(undefined);

			setIsLoadingGame(true);
			messageApi.open({
				key,
				content: 'Đang tải dữ liệu game',
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
				content: `Đã tải game: ${game.name}`,
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
	}, [dispatch, gameId, messageApi]);

	const stopReplay = () => {
		replayState.playing = false;
	};

	const stopPlaying = () => {
		playRealState.playing = false;
	};

	const canPlay = useMemo(
		() =>
			game
				? new Date(game.start_time).getTime() + game.num_of_turns * game.time_per_turn * 1000 > Date.now()
				: false,
		[game],
	);

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
						<>
							<Button icon={<ReloadOutlined />} loading={isReplaying} onClick={handleReplay}>
								Phát lại
							</Button>
							<Button
								icon={<PauseOutlined />}
								danger
								type='primary'
								disabled={!isReplaying}
								onClick={stopReplay}
							></Button>
						</>
					)}
					<Button
						icon={<SearchOutlined />}
						type='primary'
						loading={isLoadingGame}
						htmlType='submit'
						disabled={!gameId}
					>
						Tải
					</Button>
				</Space.Compact>
			</form>

			{game ? (
				<Space direction='vertical' style={{ width: '100%', marginTop: 10 }}>
					{postErrorCount > 0 && (
						<Alert
							showIcon
							message={<strong>{`Lỗi khi [POST]: ${postErrorCount}`}</strong>}
							description='Số lần gửi action thất bại'
							type='error'
						/>
					)}

					{canPlay && (
						<Space wrap>
							<Select
								placeholder='Đội'
								value={side}
								suffixIcon={<UserOutlined />}
								onChange={setSide}
								options={game.sides.map((e) => ({
									value: e.side,
									label: `Đội ${e.side} - ${e.team_name}`,
								}))}
							/>

							<Select
								options={gameModes.map((mode) => ({ value: mode, label: mode }))}
								placeholder='Giải thuật'
								value={gameMode}
								onChange={(value) => setGameMode(value)}
							/>

							<Button
								icon={<PlayCircleOutlined />}
								type='primary'
								loading={isPlaying}
								onClick={handlePlayReal}
							>
								Chơi
							</Button>

							<Button
								icon={<PauseOutlined />}
								danger
								type='primary'
								disabled={!isPlaying}
								onClick={stopPlaying}
							></Button>
						</Space>
					)}

					{!!waitTime && (
						<Descriptions bordered>
							<DescriptionsItem label='Đợi'>
								<CountDown seconds={waitTime / 1000} />
							</DescriptionsItem>
						</Descriptions>
					)}

					{isShowCountDown && (
						<Descriptions bordered column={1}>
							<DescriptionsItem label='Đếm ngược'>
								<CountDown seconds={game.time_per_turn} />
							</DescriptionsItem>
						</Descriptions>
					)}

					<GameInfo game={game} currentTurn={gameState?.lastTurn} />

					<ActionList actions={currentGameActions} />
				</Space>
			) : (
				<Empty description='Tải game để hiển thị' style={{ margin: '20px 0' }} />
			)}
		</>
	);
}
