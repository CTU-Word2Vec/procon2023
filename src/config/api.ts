const apiConfig = {
	url: import.meta.env.VITE_APP_API_URL,
	headers: {
		authorization: `${import.meta.env.VITE_APP_HEADER_AUTHORIZATION}`,
	},
};

export default apiConfig;
