import React from 'react';
import styles from './index.module.scss';

export interface CraftmenProps {
	id: string;
}

export default class Craftsmen extends React.Component<CraftmenProps> {
	protected imgSource: string = '';
	protected color: string = '#0000b6';

	constructor(props: CraftmenProps) {
		super(props);
	}

	render(): React.ReactNode {
		return (
			<div
				className={styles.wrapper}
				style={{
					borderColor: this.color,
				}}
			>
				<img src={this.imgSource} alt='Craftmen' style={{ width: '100%' }} />

				<span className={styles.id} style={{ background: this.color }}>
					{this.props.id}
				</span>
			</div>
		);
	}
}
