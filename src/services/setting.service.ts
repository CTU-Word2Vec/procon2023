export class SettingService {
	private readonly tokenName = 'token';
	private _token = '';

	private readonly endpointName = 'endpoint';
	private _endpoint = '';

	constructor() {
		if (typeof window === 'undefined') return;

		this._token = window.localStorage.getItem(this.tokenName) || '';
		this._endpoint = localStorage.getItem(this.endpointName) || import.meta.env.VITE_APP_API_URL;
	}

	get token(): string {
		return this._token;
	}

	set token(v: string) {
		this._token = v;
		window.localStorage.setItem(this.tokenName, v);
	}

	get endpoint(): string {
		return this._endpoint;
	}

	set endpoint(v: string) {
		this._endpoint = v;
		window.localStorage.setItem(this.endpointName, v);
	}
}

export default new SettingService() as SettingService;
