import { App, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import router from './router/index.tsx';
import store from './store/index.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<ConfigProvider
				componentSize='large'
				theme={{
					token: {
						colorPrimary: '#06619e',
						fontFamily: "'Montserrat', sans-serif",
					},
				}}
			>
				<App>
					<RouterProvider router={router} />
				</App>
			</ConfigProvider>
		</Provider>
	</React.StrictMode>,
);
