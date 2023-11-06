/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Descriptions, Divider, Input, Row, Select, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import GameBoard from './components/game-board';
import Game from './models/Game';
import GameStatus from './models/GameStatus';
import gameService from './services/game.service';
import playerService from './services/player.service';

function App() {
	const [gameId, setGameId] = useState<string>();
	const [game, setGame] = useState<Game>();
	const [side, setSide] = useState<string>('A');
	const [isLoadingGame, setIsLoadingGame] = useState(false);
	const [, setStatus] = useState<GameStatus>();

	const handleStart = async () => {
		if (!gameId) return;
		try {
			setIsLoadingGame(true);
			const res = await playerService.getGameById(+gameId);
			const status = await gameService.getGameStatus(+gameId);
			setStatus(status);

			setGame(res);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsLoadingGame(false);
		}
	};

	const craftmens = useMemo(() => {
		return game?.field.craftsmen.filter((craftmen) => craftmen.side === side) || [];
	}, [side, game]);

	const handleRandom = async () => {
		if (!gameId) return;
		try {
			await playerService.createAction(+gameId, {
				actions: craftmens.map((e) => {
					return {
						action: 'MOVE',
						craftsman_id: e.id,
						action_param: 'LEFT',
					};
				}),
				turn: 1,
			});

			await gameService.getGameStatus(+gameId);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	return (
		<Row>
			<Col xs={12}>
				<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 64 }}>
					{game && <GameBoard field={game.field} />}
				</div>
			</Col>

			<Col xs={12} style={{ padding: 10 }}>
				<Input placeholder='Game Id' value={gameId} onChange={(event) => setGameId(event.target.value)} />

				<Button style={{ marginTop: 10 }} type='primary' loading={isLoadingGame} onClick={handleStart}>
					Start
				</Button>

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
								label: e.team_name,
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

						<Button onClick={handleRandom}>Random</Button>
					</>
				)}
			</Col>
		</Row>
	);
}

export default App;
