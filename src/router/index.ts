import DefaultLayout from '@/layouts/default';
import HomePage from '@/pages';
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
	},
]);

export default router;
