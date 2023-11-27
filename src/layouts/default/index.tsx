import AppHeader from '@/components/app-header';
import { RootState } from '@/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';

export default function DefaultLayout() {
	const auth = useSelector((state: RootState) => state.auth);
	const navigate = useNavigate();

	useEffect(() => {
		// If user is authenticated, redirect to page
		if (!auth) navigate('/auth');
	}, [auth, navigate]);

	return (
		<>
			<AppHeader />
			<Outlet />
		</>
	);
}
