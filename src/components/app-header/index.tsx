import logoCtu from '@/assets/logo-ctu.png';
import { RootState } from '@/store';
import { CodeOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import GameJsonModal from '../game-json-modal';
import GameSettings from '../game-settings';
import styles from './index.module.scss';

export default function AppHeader() {
	const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
	const [openJsonModal, setOpenJsonModal] = useState(false);

	const gameState = useSelector((state: RootState) => state.gameState.gameState);

	return (
		<>
			<div className={styles.wrapper}>
				<div className={styles.brand}>
					<img src={logoCtu} alt='Logo CTU' />
					<h2>CTU.Word2Vec</h2>
				</div>

				<Space>
					<Button
						icon={<QuestionCircleOutlined />}
						href='https://thangved.github.io/procon2023-docs'
						target='_blank'
						rel='noreferrer'
					>
						Hướng dẫn
					</Button>

					{gameState && (
						<Button icon={<CodeOutlined />} onClick={() => setOpenJsonModal(true)}>
							JSON
						</Button>
					)}
					<Button icon={<SettingOutlined />} type='primary' onClick={() => setIsOpenSettingsModal(true)}>
						Cấu hình
					</Button>
				</Space>
			</div>

			<GameSettings open={isOpenSettingsModal} onCancel={() => setIsOpenSettingsModal(false)} />

			<GameJsonModal open={openJsonModal} gameState={gameState!} onClose={() => setOpenJsonModal(false)} />
		</>
	);
}
