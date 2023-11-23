import { BugOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { App as AntdApp, Col, Empty, Row, Spin, Tabs } from 'antd';
import { Suspense, lazy, useState } from 'react';
import AppHeader from './components/app-header';

import GameBoardWrapper from './components/game-board-wrapper';
import { GameStateData } from './game/GameManager';

const GameScore = lazy(() => import('./components/game-score'));
const GameBoard = lazy(() => import('./components/game-board'));
const PlayTestTab = lazy(() => import('./components/play-test-tab'));
const PlayRealTab = lazy(() => import('./components/play-real-tab'));

function App() {
	const [gameState, setGameState] = useState<GameStateData>();
	const [activeKey, setActiveKey] = useState('play-real');

	return (
		<AntdApp>
			<AppHeader />
			<Row>
				<Col md={24} lg={12}>
					<GameBoardWrapper>
						<Suspense fallback={<Spin />} key={activeKey}>
							{gameState ? (
								<GameBoard state={gameState as GameStateData} />
							) : (
								<Empty description='There are no game selected' />
							)}
						</Suspense>
					</GameBoardWrapper>
				</Col>

				<Col xs={24} md={12} lg={6}>
					<Suspense key={activeKey} fallback={<Spin />}>
						{gameState ? (
							<GameScore state={gameState} />
						) : (
							<Empty description='There are no game selected' style={{ marginTop: 10 }} />
						)}
					</Suspense>
				</Col>

				<Col xs={24} md={12} lg={6} style={{ padding: 10 }}>
					<Tabs
						type='card'
						activeKey={activeKey}
						onChange={(key) => setActiveKey(key)}
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
