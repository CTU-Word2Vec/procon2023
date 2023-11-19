import logoCtu from '@/assets/logo-ctu.png';
import { SettingOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import GameSettings from '../game-settings';
import styles from './index.module.scss';

export default function AppHeader() {
	const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);

	return (
		<>
			<div className={styles.wrapper}>
				<div className={styles.brand}>
					<img src={logoCtu} alt='Logo CTU' />
					<h2>CTU.Word2Vec</h2>
				</div>

				<Button icon={<SettingOutlined />} type='primary' onClick={() => setIsOpenSettingsModal(true)}>
					Config
				</Button>
			</div>

			<GameSettings open={isOpenSettingsModal} onCancel={() => setIsOpenSettingsModal(false)} />
		</>
	);
}
