import DefaultLayout from '@/layouts/default';
import HomePage from '@/pages';
import NotFoundPage from '@/pages/NotFound';
import AuthPage from '@/pages/auth';
import { createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
	{
		path: '/',
		Component: DefaultLayout,
		children: [
			{
				path: '',
				Component: HomePage,
			},
		],
		errorElement: <NotFoundPage />,
	},
	{
		path: '/auth',
		Component: AuthPage,
	},
]);

export default router;
