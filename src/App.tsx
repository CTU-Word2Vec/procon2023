/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Col, Descriptions, Divider, Input, Row, Select, message } from 'antd';
import DescriptionsItem from 'antd/es/descriptions/Item';
import dayjs from 'dayjs';
import { useState } from 'react';
import Game from './models/Game';
import playerService from './services/player.service';

function App() {
	const [gameId, setGameId] = useState<string>();
	const [game, setGame] = useState<Game>();
	const [side, setSide] = useState<string>('A');
	const [isLoadingGame, setIsLoadingGame] = useState(false);

	const handleStart = async () => {
		if (!gameId) return;
		try {
			setIsLoadingGame(true);
			const res = await playerService.getGameById(+gameId);

			setGame(res);
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsLoadingGame(false);
		}
	};

	// const craftmens = useMemo(() => {
	// 	return game?.field.craftsmen.filter((craftmen) => craftmen.side === side) || [];
	// }, [side, game]);

	return (
		<Row>
			<Col xs={12}></Col>

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
					</>
				)}
			</Col>
		</Row>
	);
}

export default App;
