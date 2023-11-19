import { BugOutlined, PlayCircleOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { App as AntdApp, Button, Col, Row, Spin, Tabs } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import { Suspense, lazy, useState } from 'react';
import styles from './App.module.scss';
import AppHeader from './components/app-header';
import GameBoard from './components/game-board';
import { GameStateData } from './game/GameManager';

const PlayTestTab = lazy(() => import('./components/play-test-tab'));
const PlayRealTab = lazy(() => import('./components/play-real-tab'));

function App() {
	const [gameState, setGameState] = useState<GameStateData>();
	const [zoom, setZoom] = useState(100);

	const zoomIn = () => {
		setZoom(zoom + 10);
	};

	const zoomOut = () => {
		setZoom(zoom - 10);
	};

	return (
		<AntdApp>
			<AppHeader />
			<Row>
				<Col xs={24} md={12} lg={18}>
					<div className={styles.gameBoard}>
						{gameState && (
							<>
								<div style={{ transform: `scale(${zoom / 100})` }} className={styles.inner}>
									<GameBoard state={gameState as GameStateData} />
								</div>

								<div className={styles.zoomActions}>
									<ButtonGroup>
										<Button icon={<ZoomOutOutlined />} onClick={zoomOut}></Button>
										<Button>{zoom}%</Button>
										<Button icon={<ZoomInOutlined />} onClick={zoomIn}></Button>
									</ButtonGroup>
								</div>
							</>
						)}
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
