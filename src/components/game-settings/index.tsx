/* eslint-disable @typescript-eslint/no-explicit-any */
import playerService from '@/services/player.service';
import settingService from '@/services/setting.service';
import { ApiOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Input, InputNumber, Modal, Space, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';

export interface GameSettingsProps {
	open: boolean;
	onCancel: () => void;
}

export default function GameSettings({ open, onCancel }: GameSettingsProps) {
	const [token, setToken] = useState<string>(() => settingService.token);
	const [apiEndpoint, setApiEndpoint] = useState<string>(() => settingService.endpoint);
	const [replayDelay, setReplayDelay] = useState<number>(() => settingService.replayDelay);

	useEffect(() => {
		settingService.token = token;
	}, [token]);

	useEffect(() => {
		settingService.endpoint = apiEndpoint;
	}, [apiEndpoint]);

	useEffect(() => {
		settingService.replayDelay = replayDelay;
	}, [replayDelay]);

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

				<InputNumber
					placeholder='Replay delay'
					value={replayDelay}
					style={{ width: '100%' }}
					min={0}
					max={9000}
					prefix={<ClockCircleOutlined />}
					required
					onChange={(value) => setReplayDelay(value as number)}
				/>
			</Space>
		</Modal>
	);
}
