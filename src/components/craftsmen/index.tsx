import clsx from 'clsx';
import React from 'react';
import styles from './index.module.scss';

export interface CraftmenProps {
	size?: number;
	noBorder?: boolean;
	noShadow?: boolean;
	noScale?: boolean;
}

export default class Craftsmen extends React.Component<CraftmenProps> {
	protected imgSource: string = '';
	protected color: string = '#0000b6';

	constructor(props: CraftmenProps) {
		super(props);
	}

	render(): React.ReactNode {
		const { size, noBorder, noScale, noShadow } = this.props;

		return (
			<div
				className={clsx(styles.wrapper, {
					[styles.noBorder]: noBorder,
					[styles.noShadow]: noShadow,
					[styles.noScale]: noScale,
				})}
				style={{
					borderColor: this.color,
					width: size,
				}}
			>
				<img
					src={this.imgSource}
					alt='Craftmen'
					style={{
						width: '100%',
					}}
				/>
			</div>
		);
	}
}
