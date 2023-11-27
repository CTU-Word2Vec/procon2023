import GameBoardWrapper from '@/components/game-board-wrapper';
import { RootState } from '@/store';
import { BugOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Col, Empty, Row, Spin, Tabs } from 'antd';
import { Suspense, lazy, useState } from 'react';
import { useSelector } from 'react-redux';

const GameScore = lazy(() => import('@/components/game-score'));
const GameBoard = lazy(() => import('@/components/game-board'));
const PlayTestTab = lazy(() => import('@/components/play-test-tab'));
const PlayRealTab = lazy(() => import('@/components/play-real-tab'));

const MainGame = () => {
	const gameState = useSelector((state: RootState) => state.gameState.gameState);
	const currentAction = useSelector((state: RootState) => state.gameState.currentAction);

	return (
		<GameBoardWrapper>
			<Suspense fallback={<Spin />}>
				{gameState ? (
					<GameBoard state={gameState} action={currentAction} />
				) : (
					<Empty description='There are no games selected' />
				)}
			</Suspense>
		</GameBoardWrapper>
	);
};

const GameDashboard = () => {
	const gameState = useSelector((state: RootState) => state.gameState.gameState);

	return (
		<Suspense fallback={<Spin />}>
			{gameState ? (
				<GameScore state={gameState} />
			) : (
				<Empty description='Get game data to play' style={{ margin: '20px 0' }} />
			)}
		</Suspense>
	);
};

function HomePage() {
	const [activeKey, setActiveKey] = useState('play-real');

	return (
		<Row>
			<Col xs={24} md={24} lg={12}>
				<MainGame />
			</Col>

			<Col xs={24} md={12} lg={6}>
				<GameDashboard />
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
									<PlayRealTab />
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
									<PlayTestTab />
								</Suspense>
							),
						},
					]}
				/>
			</Col>
		</Row>
	);
}

export default HomePage;
