class EndpointService {
	private readonly endpointKey = 'endpoint';
	private _endpoint: string;

	constructor() {
		this._endpoint = localStorage.getItem(this.endpointKey) || import.meta.env.VITE_APP_API_URL;
	}

	get endpoint() {
		return this._endpoint;
	}

	set endpoint(v: string) {
		this._endpoint = v;
		localStorage.setItem(this.endpointKey, v);
	}
}

export default new EndpointService() as EndpointService;
