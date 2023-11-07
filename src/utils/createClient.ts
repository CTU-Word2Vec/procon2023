import apiConfig from '@/config/api';
import tokenService from '@/services/token.service';
import axios from 'axios';

export default function createClient(baseURL: string = '/') {
	const client = axios.create({ baseURL: `${apiConfig.url}/${baseURL}` });

	client.interceptors.request.use((req) => {
		req.headers.Authorization = tokenService.token;

		return req;
	});

	client.interceptors.response.use(
		(res) => res.data,
		(error) => {
			throw error.response?.data
				? {
						message: error.response.data.detail,
						// eslint-disable-next-line no-mixed-spaces-and-tabs
				  }
				: error;
		},
	);

	return client;
}
