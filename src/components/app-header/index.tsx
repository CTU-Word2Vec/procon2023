import logoCtu from '@/assets/logo-ctu.png';
import styles from './index.module.scss';

export default function AppHeader() {
	return (
		<div className={styles.wrapper}>
			<div className={styles.brand}>
				<img src={logoCtu} alt='Logo CTU' />
				<h2>CTU.Word2Vec</h2>
			</div>
		</div>
	);
}
