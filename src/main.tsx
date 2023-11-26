import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import store from './store/index.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<ConfigProvider
				componentSize='large'
				theme={{
					token: {
						colorPrimary: '#06619e',
					},
				}}
			>
				<App />
			</ConfigProvider>
		</Provider>
	</React.StrictMode>,
);
