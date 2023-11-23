/* eslint-disable @typescript-eslint/no-explicit-any */
import useDebouce from '@/hooks/useDebouce';
import playerService from '@/services/player.service';
import settingService from '@/services/setting.service';
import {
	ApiOutlined,
	CheckCircleOutlined,
	ClockCircleFilled,
	ClockCircleOutlined,
	CloseCircleOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, message } from 'antd';
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

	const deboucedToken = useDebouce(token);
	const deboucedApiEndpoint = useDebouce(apiEndpoint);
	const deboucedReplayDelay = useDebouce(replayDelay);

	useEffect(() => {
		settingService.token = deboucedToken;
	}, [deboucedToken]);

	useEffect(() => {
		settingService.endpoint = deboucedApiEndpoint;
	}, [deboucedApiEndpoint]);

	useEffect(() => {
		settingService.replayDelay = deboucedReplayDelay;
	}, [deboucedReplayDelay]);

	const check = async () => {
		try {
			const res = await playerService.getTime();

			const serverTime = new Date(res.time).getTime();
			const clientTime = new Date().getTime();

			message.success({
				content: `Ping: ${Math.abs(clientTime - serverTime)}ms`,
				icon: <ClockCircleFilled />,
			});
		} catch (error: any) {
			message.error(error.message);
		}
	};

	return (
		<Modal
			title='Setting'
			open={open}
			okText='Check'
			okButtonProps={{
				icon: <CheckCircleOutlined />,
			}}
			cancelButtonProps={{
				icon: <CloseCircleOutlined />,
			}}
			onCancel={onCancel}
			onOk={check}
		>
			<Form layout='vertical'>
				<Form.Item label='Token'>
					<TextArea
						placeholder='Token'
						value={token}
						rows={5}
						onChange={(event) => setToken(event.target.value)}
					/>
				</Form.Item>

				<Form.Item label='API endpoint'>
					<Input
						placeholder='https://api.procon2023.com/api'
						value={apiEndpoint}
						prefix={<ApiOutlined />}
						onChange={(event) => setApiEndpoint(event.target.value)}
					/>
				</Form.Item>

				<Form.Item label='Replay deplay (ms)'>
					<Input
						placeholder='Replay deplay'
						value={replayDelay}
						type='number'
						prefix={<ClockCircleOutlined />}
						onChange={(event) => setReplayDelay(Number(event.target.value))}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
