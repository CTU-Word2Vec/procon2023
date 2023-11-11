import React from 'react';
import styles from './index.module.scss';

export interface CraftmenProps {
	id: string;
}

export default class Craftsmen extends React.Component<CraftmenProps> {
	public imgSource = '';
	public color = '#0000b6';

	constructor(props: CraftmenProps) {
		super(props);
	}

	render(): React.ReactNode {
		return (
			<div className={styles.wrapper} style={{ width: 32, height: 32, border: `2px solid ${this.color}` }}>
				<img src={this.imgSource} alt='Craftmen' style={{ width: '100%' }} />

				<span className={styles.id} style={{ background: this.color }}>
					{this.props.id}
				</span>
			</div>
		);
	}
}
