import craftmenB from '@/assets/icons/craftsman-b.svg';
import styles from './index.module.scss';

export interface CraftmenBProps {
	style?: React.HTMLAttributes<HTMLDivElement>;
	id: string;
}

export default function CraftsmenB({ style, id }: CraftmenBProps) {
	return (
		<div className={styles.wrapper} style={{ width: 32, height: 32, ...style }}>
			<img src={craftmenB} alt='Craftmen B' style={{ width: '100%' }} />

			<span className={styles.id}>{id}</span>
		</div>
	);
}
