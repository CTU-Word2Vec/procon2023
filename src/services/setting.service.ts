class SettingService {
	private readonly tokenName = 'token';
	private _token = '';

	private readonly endpointName = 'endpoint';
	private _endpoint = '';

	private readonly replayDelayName = 'replay_delay';
	private _replayDelay = 100;

	constructor() {
		if (typeof window === 'undefined') return;

		this._token = window.localStorage.getItem(this.tokenName) || '';
		this._endpoint = localStorage.getItem(this.endpointName) || import.meta.env.VITE_APP_API_URL;
		this._replayDelay = Number(localStorage.getItem(this.replayDelayName)) || 100;
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

	get replayDelay(): number {
		return this._replayDelay;
	}

	set replayDelay(v: number) {
		this._replayDelay = this.replayDelay;
		window.localStorage.setItem(this.replayDelayName, String(v));
	}
}

export default new SettingService() as SettingService;
