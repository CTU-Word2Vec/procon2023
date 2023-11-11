/* eslint-disable @typescript-eslint/no-explicit-any */
import playerService from '@/services/player.service';
import settingService from '@/services/setting.service';
import { ApiOutlined } from '@ant-design/icons';
import { Input, Modal, Space, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';

export interface GameSettingsProps {
	open: boolean;
	onCancel: () => void;
}

export default function GameSettings({ open, onCancel }: GameSettingsProps) {
	const [token, setToken] = useState<string>(() => settingService.token);
	const [apiEndpoint, setApiEndpoint] = useState<string>(() => settingService.endpoint);

	useEffect(() => {
		settingService.token = token;
	}, [token]);

	useEffect(() => {
		settingService.endpoint = apiEndpoint;
	}, [apiEndpoint]);

	const check = async () => {
		try {
			const res = await playerService.getTime();

			const serverTime = new Date(res.time).getTime();
			const clientTime = new Date().getTime();

			message.success(`${Math.abs(clientTime - serverTime)}ms`);
		} catch (error: any) {
			message.error(error.message);
		}
	};

	return (
		<Modal title='Setting' open={open} okText='Check' onCancel={onCancel} onOk={check}>
			<Space direction='vertical' style={{ width: '100%' }}>
				<TextArea
					placeholder='Token'
					value={token}
					rows={5}
					onChange={(event) => setToken(event.target.value)}
				/>

				<Input
					placeholder='Api endpoint'
					value={apiEndpoint}
					prefix={<ApiOutlined />}
					onChange={(event) => setApiEndpoint(event.target.value)}
				/>
			</Space>
		</Modal>
	);
}
