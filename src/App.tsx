/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Descriptions, Divider, Input, Row, Select, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import GameBoard from './components/game-board';
import Game from './models/Game';
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

	const handleStart = async () => {
		if (!gameId) return;
		try {
			setIsLoadingGame(true);
			const game = await playerService.getGameById(+gameId);

			const gameState = new GameState(game.field);

			setGameState(gameState);
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

			const { remaining } = await playerService.getGameStatus(game.id);

			await wait(remaining * 1000);
		}
	};

	return (
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
					<Input placeholder='Game Id' value={gameId} onChange={(event) => setGameId(event.target.value)} />

					<Input
						placeholder='Token'
						value={tokenService.token}
						style={{ marginTop: 10 }}
						onChange={(event) => (tokenService.token = event.target.value)}
					/>

					<Button style={{ marginTop: 10 }} type='primary' loading={isLoadingGame} htmlType='submit'>
						Start
					</Button>
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

						<Button onClick={handlePlay} style={{ marginTop: 10 }}>
							Play
						</Button>
					</>
				)}
			</Col>
		</Row>
	);
}

export default App;
