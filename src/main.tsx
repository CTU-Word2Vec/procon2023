import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
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
	</React.StrictMode>,
);
