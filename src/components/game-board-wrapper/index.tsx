import { FullscreenExitOutlined, FullscreenOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import ButtonGroup from 'antd/es/button/button-group';
import clsx from 'clsx';
import { ReactNode, useState } from 'react';
import styles from './index.module.scss';

export interface GameBoardWrapperProps {
	children: ReactNode;
}

export default function GameBoardWrapper({ children }: GameBoardWrapperProps) {
	const [zoom, setZoom] = useState(100);
	const [isOpenFullScreen, setIsOpenFullscreen] = useState(false);

	const zoomIn = () => {
		setZoom(zoom + 10);
	};

	const zoomOut = () => {
		setZoom(zoom - 10);
	};

	return (
		<div
			className={clsx(styles.wrapper, {
				[styles.isFullScreen]: isOpenFullScreen,
			})}
		>
			<div style={{ transform: `scale(${zoom / 100})` }} className={styles.inner}>
				{children}
			</div>

			<div className={styles.zoomActions}>
				<ButtonGroup>
					<Button
						icon={<ZoomOutOutlined />}
						type={zoom < 100 ? 'primary' : 'default'}
						onClick={zoomOut}
					></Button>
					<Button type={zoom === 100 ? 'primary' : 'default'} onClick={() => setZoom(100)}>
						{zoom}%
					</Button>
					<Button
						icon={<ZoomInOutlined />}
						type={zoom > 100 ? 'primary' : 'default'}
						onClick={zoomIn}
					></Button>
				</ButtonGroup>
			</div>

			<div className={styles.fullScreenButton}>
				<Button
					icon={isOpenFullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
					type={isOpenFullScreen ? 'primary' : 'default'}
					onClick={() =>
						setIsOpenFullscreen((prev) => {
							if (prev) {
								document.exitFullscreen();
							} else {
								document.documentElement.requestFullscreen();
							}

							return !prev;
						})
					}
				></Button>
			</div>
		</div>
	);
}
