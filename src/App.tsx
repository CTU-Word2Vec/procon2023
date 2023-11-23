import {
	BugOutlined,
	FullscreenExitOutlined,
	FullscreenOutlined,
	PlayCircleOutlined,
	ZoomInOutlined,
	ZoomOutOutlined,
} from '@ant-design/icons';
import { App as AntdApp, Button, Col, Row, Spin, Tabs } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import clsx from 'clsx';
import { Suspense, lazy, useState } from 'react';
import styles from './App.module.scss';
import AppHeader from './components/app-header';

import { GameStateData } from './game/GameManager';

const GameScore = lazy(() => import('./components/game-score'));
const GameBoard = lazy(() => import('./components/game-board'));
const PlayTestTab = lazy(() => import('./components/play-test-tab'));
const PlayRealTab = lazy(() => import('./components/play-real-tab'));

function App() {
	const [gameState, setGameState] = useState<GameStateData>();
	const [zoom, setZoom] = useState(100);
	const [isOpenFullScreen, setIsOpenFullscreen] = useState(false);

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
				<Col md={24} lg={12}>
					<div
						className={clsx(styles.gameBoard, {
							[styles.isFullScreen]: isOpenFullScreen,
						})}
					>
						<Suspense fallback={<Spin />}>
							{gameState && (
								<>
									<div style={{ transform: `scale(${zoom / 100})` }} className={styles.inner}>
										<GameBoard state={gameState as GameStateData} />
									</div>

									<div className={styles.zoomActions}>
										<ButtonGroup>
											<Button
												icon={<ZoomOutOutlined />}
												type={zoom < 100 ? 'primary' : 'default'}
												onClick={zoomOut}
											></Button>
											<Button
												type={zoom === 100 ? 'primary' : 'default'}
												onClick={() => setZoom(100)}
											>
												{zoom}%
											</Button>
											<Button
												icon={<ZoomInOutlined />}
												type={zoom > 100 ? 'primary' : 'default'}
												onClick={zoomIn}
											></Button>
										</ButtonGroup>
									</div>
									<div className={styles.fullScreenButton}>
										<Button
											icon={
												isOpenFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
											}
											type={isOpenFullScreen ? 'primary' : 'default'}
											onClick={() =>
												setIsOpenFullscreen((prev) => {
													if (prev) {
														document.exitFullscreen();
													} else {
														document.documentElement.requestFullscreen();
													}

													return !prev;
												})
											}
										></Button>
									</div>
								</>
							)}
						</Suspense>
					</div>
				</Col>

				<Col xs={24} md={12} lg={6}>
					<Suspense fallback={<Spin />}>{gameState && <GameScore state={gameState} />}</Suspense>
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
								children: (
									<Suspense fallback={<Spin />}>
										<PlayRealTab gameState={gameState} onGameStateChange={setGameState} />
									</Suspense>
								),
							},
							{
								label: (
									<span>
										<BugOutlined />
										Play test
									</span>
								),
								key: 'real-test',
								children: (
									<Suspense fallback={<Spin />}>
										<PlayTestTab gameState={gameState} onGameStateChange={setGameState} />
									</Suspense>
								),
							},
						]}
					/>
				</Col>
			</Row>
		</AntdApp>
	);
}

export default App;
