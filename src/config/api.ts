/**
 * @description API config
 * @interface
 */
export interface ApiConfig {
	/**
	 * @description API URL
	 */
	url: string;
}

const apiConfig: ApiConfig = {
	url: import.meta.env.VITE_APP_API_URL,
};

export default apiConfig;
