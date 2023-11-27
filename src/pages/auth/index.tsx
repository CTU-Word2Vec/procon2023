/* eslint-disable @typescript-eslint/no-explicit-any */
import logoCtu from '@/assets/logo-ctu.png';
import authService from '@/services/auth.service';
import { setAuth } from '@/store/auth';
import { Avatar, Button, Form, Input, message } from 'antd';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import styles from './index.module.scss';

type AuthForm = {
	password: string;
};

export default function AuthPage() {
	const dispatch = useDispatch();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = useCallback(
		async (values: AuthForm) => {
			try {
				setIsLoading(true);
				const res = await authService.login(values.password);

				dispatch(setAuth(res));
				navigate('/');
			} catch (error: any) {
				message.error(error.message);
			} finally {
				setIsLoading(false);
			}
		},
		[dispatch, navigate],
	);

	return (
		<div className={styles.wrapper}>
			<Form layout='vertical' onFinish={handleSubmit}>
				<div className={styles.brand}>
					<Avatar src={logoCtu} size={100} />
				</div>

				<h2 className={styles.title}>Authentication</h2>

				<Form.Item name='password' label='Password'>
					<Input placeholder='Password' type='password' autoComplete='password' name='password' required />
				</Form.Item>

				<Button htmlType='submit' type='primary' block loading={isLoading}>
					Login
				</Button>
			</Form>
		</div>
	);
}
