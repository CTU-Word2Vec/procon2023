import { BugOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { App as AntdApp, Col, Row, Spin, Tabs } from 'antd';
import { Suspense, lazy, useState } from 'react';
import styles from './App.module.scss';
import AppHeader from './components/app-header';
import GameBoard from './components/game-board';
import { GameStateData } from './game/GameManager';

const PlayTestTab = lazy(() => import('./components/play-test-tab'));
const PlayRealTab = lazy(() => import('./components/play-real-tab'));

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
					<Suspense fallback={<Spin />}>
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
											<BugOutlined />
											Play test
										</span>
									),
									key: 'real-test',
									children: <PlayTestTab gameState={gameState} onGameStateChange={setGameState} />,
								},
							]}
						/>
					</Suspense>
				</Col>
			</Row>
		</AntdApp>
	);
}

export default App;
