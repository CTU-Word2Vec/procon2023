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
	const [isPinging, setIsPinging] = useState<boolean>(false);

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
			setIsPinging(true);
			const res = await playerService.getTime();

			const serverTime = new Date(res.time).getTime();

			if (isNaN(serverTime)) {
				throw new Error('Không thể lấy thời gian từ máy chủ');
			}

			const clientTime = new Date().getTime();

			message.success({
				content: `Ping: ${Math.abs(clientTime - serverTime)}ms`,
				icon: <ClockCircleFilled />,
			});
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsPinging(false);
		}
	};

	return (
		<Modal
			title='Cấu hình'
			open={open}
			okText='Ping'
			cancelText='Đóng'
			okButtonProps={{
				icon: <CheckCircleOutlined />,
				loading: isPinging,
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

				<Form.Item label='Điểm cuối API'>
					<Input
						placeholder='https://api.procon2023.com/api'
						value={apiEndpoint}
						prefix={<ApiOutlined />}
						onChange={(event) => setApiEndpoint(event.target.value)}
					/>
				</Form.Item>

				<Form.Item label='Delay phát lại(ms)'>
					<Input
						placeholder='Delay phát lại(ms)'
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
