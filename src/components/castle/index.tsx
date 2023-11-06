import castle from '@/assets/icons/castle-icon.png';
import styles from './index.module.scss';

export default function Castle() {
	return (
		<div className={styles.wrapper}>
			<img src={castle} alt='Castle' />
		</div>
	);
}
