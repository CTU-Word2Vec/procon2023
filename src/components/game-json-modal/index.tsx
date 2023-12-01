import { IGameStateData } from '@/game/interfaces';
import { DownloadOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { Modal } from 'antd';
import { useCallback, useMemo } from 'react';

export interface GameJsonModalProps {
	open: boolean;
	gameState?: IGameStateData;
	onClose: () => void;
}

export default function GameJsonModal({ open, gameState, onClose }: GameJsonModalProps) {
	const jsonData = useMemo(() => JSON.stringify(gameState, null, 4), [gameState]);

	const downloadJsonFile = useCallback(() => {
		// Create json file
		const file = new File([jsonData], gameState?.name + '.json', {
			type: 'application/json',
		});

		// Create temp file url
		const url = URL.createObjectURL(file);

		// Create <a> element
		const a = document.createElement('a');
		a.download = file.name; // Set download file name
		a.href = url; // Set <a> href
		a.hidden = true; // Set <a> to invisible
		document.body.appendChild(a); // Append <a> to <body>
		a.click(); // Click trigger
		a.remove(); // Remove <a>

		URL.revokeObjectURL(url); // Remove blob url
	}, [jsonData, gameState]);

	return (
		<Modal
			title={`[${gameState?.name}] Thông tin game dạng Json`}
			width={700}
			okText='Tải về'
			okButtonProps={{
				icon: <DownloadOutlined />,
			}}
			onOk={downloadJsonFile}
			open={open}
			onCancel={onClose}
		>
			<div style={{ borderRadius: 5, overflow: 'hidden' }}>
				<Editor
					value={jsonData}
					language='json'
					height={500}
					theme='vs-dark'
					options={{
						readOnly: true,
						automaticLayout: true,
					}}
				/>
			</div>
		</Modal>
	);
}
