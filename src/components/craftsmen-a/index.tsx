import craftmenA from '@/assets/icons/craftsman-a.svg';
import styles from './index.module.scss';

export interface CraftmenAProps {
	style?: React.HTMLAttributes<HTMLDivElement>;
	id: string;
}

export default function CraftsmenA({ style, id }: CraftmenAProps) {
	return (
		<div className={styles.wrapper} style={{ width: 32, height: 32, ...style }}>
			<img src={craftmenA} alt='Craftmen A' style={{ width: '100%' }} />

			<span className={styles.id}>{id}</span>
		</div>
	);
}
