import axios from 'axios';
import apiConfig from '../config/api';

export default function createClient(baseURL: string = '/') {
	const client = axios.create({ baseURL: `${apiConfig.url}/${baseURL}` });

	client.interceptors.request.use((req) => {
		req.headers.Authorization = apiConfig.headers.authorization;

		return req;
	});

	client.interceptors.response.use(
		(res) => res.data,
		(error) => {
			throw error.response?.data || error;
		},
	);

	return client;
}
