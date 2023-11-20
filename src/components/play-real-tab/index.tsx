/* eslint-disable @typescript-eslint/no-explicit-any */
import GameManager, { GameMode, GameStateData, gameModes } from '@/game/GameManager';
import { EWallSide } from '@/game/WallPosition';
import Game from '@/models/Game';
import GameAction from '@/models/GameAction';
import playerService from '@/services/player.service';
import playReal from '@/utils/playReal';
import replay from '@/utils/replay';
import { AppstoreOutlined, PlayCircleOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Descriptions, Divider, Input, Select, Space, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import { useState } from 'react';
import ActionList from '../action-list';
import CountDown from '../count-down';
import GameInfo from '../game-info';

export interface PlayRealTabProps {
	gameState?: GameStateData;
	onGameStateChange: (gameState: GameStateData) => void;
}

export default function PlayRealTab({ onGameStateChange: onGameStateChange, gameState }: PlayRealTabProps) {
	const [gameId, setGameId] = useState('');
	const [game, setGame] = useState<Game>();

	const [side, setSide] = useState<EWallSide>('A');
	const [gameMode, setGameMode] = useState<GameMode>('Caro');

	const [currentGameActions, setCurrentGameActions] = useState<GameAction[]>([]);
	const [baseGameActions, setBaseGameActions] = useState<GameAction[]>([]);

	const [isPlaying, setIsPlaying] = useState(false);
	const [isReplaying, setIsReplaying] = useState(false);
	const [isLoadingGame, setIsLoadingGame] = useState(false);

	const handlePlayReal = () => {
		setIsPlaying(true);
		playReal({
			game: game!,
			side,
			onGameStateChange,
			onGameActionsChange: setCurrentGameActions,
		}).finally(() => {
			setIsPlaying(false);
		});
	};

	const handleReplay = () => {
		setIsReplaying(true);
		replay({
			game: game!,
			actions: baseGameActions,
			onGameStateChange,
		}).finally(() => setIsReplaying(false));
	};

	const handleGetGameData = async () => {
		if (!gameId) return;
		try {
			setIsLoadingGame(true);
			const game = await playerService.getGameById(+gameId);
			const currentActions = await playerService.getGameActions(game.id);
			const baseActions = await playerService.getGameActions(game.id);

			const gameManager = new GameManager(game.field);
			gameManager.addActions(currentActions);

			onGameStateChange(gameManager.getData());
			setCurrentGameActions(currentActions);
			setBaseGameActions(baseActions);

			setGame(game);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsLoadingGame(false);
		}
	};

	return (
		<>
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
			)}
		</>
	);
}
