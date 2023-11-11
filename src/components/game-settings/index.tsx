import endpointService from '@/services/endpoint.service';
import tokenService from '@/services/token.service';
import { Input, Modal, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useEffect, useState } from 'react';

export interface GameSettingsProps {
	open: boolean;
	onCancel: () => void;
}

export default function GameSettings({ open, onCancel }: GameSettingsProps) {
	const [token, setToken] = useState<string>(() => tokenService.token);
	const [apiEndpoint, setApiEndpoint] = useState<string>(() => endpointService.endpoint);

	useEffect(() => {
		tokenService.token = token;
	}, [token]);

	useEffect(() => {
		endpointService.endpoint = apiEndpoint;
	}, [apiEndpoint]);

	return (
		<Modal title='Setting' open={open} onCancel={onCancel} onOk={onCancel}>
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
					onChange={(event) => setApiEndpoint(event.target.value)}
				/>
			</Space>
		</Modal>
	);
}
