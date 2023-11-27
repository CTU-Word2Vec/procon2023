import AppHeader from '@/components/app-header';
import { Outlet } from 'react-router-dom';

export default function DefaultLayout() {
	return (
		<div>
			<AppHeader />
			<Outlet />
		</div>
	);
}
