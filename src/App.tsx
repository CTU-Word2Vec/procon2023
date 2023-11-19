import { PlayCircleOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { App as AntdApp, Col, Row, Tabs } from 'antd';
import { useState } from 'react';
import styles from './App.module.scss';
import AppHeader from './components/app-header';
import GameBoard from './components/game-board';
import PlayRealTab from './components/play-real-tab';
import { GameStateData } from './game/GameManager';

function App() {
	const [gameState, setGameState] = useState<GameStateData>();

	return (
		<AntdApp>
			<AppHeader />
			<Row>
				<Col xs={24} md={12} lg={18}>
					<div className={styles.gameBoard}>
						{gameState && <GameBoard state={gameState as GameStateData} />}
					</div>
				</Col>

				<Col xs={24} md={12} lg={6} style={{ padding: 10 }}>
					<Tabs
						type='card'
						defaultActiveKey='play-real'
						items={[
							{
								label: (
									<span>
										<PlayCircleOutlined />
										Play real
									</span>
								),
								key: 'play-real',
								children: <PlayRealTab gameState={gameState} onGameStateChange={setGameState} />,
							},
							{
								label: (
									<span>
										<ThunderboltOutlined />
										Play test
									</span>
								),
								key: 'real-test',
							},
						]}
					/>
				</Col>
			</Row>
		</AntdApp>
	);
}

export default App;
