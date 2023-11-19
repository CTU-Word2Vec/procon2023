import sunny from '@/assets/images/sunny.png';
import styles from './index.module.scss';

export default function Castle() {
	return (
		<div className={styles.wrapper}>
			<img src={sunny} alt='Castle' />
		</div>
	);
}
