/**
 * @description Settings service
 */
export class SettingService {
	private readonly tokenName = 'token';
	private _token;

	private readonly endpointName = 'endpoint';
	private _endpoint;

	private readonly replayDelayName = 'replayDelay';
	private _replayDelay: number;

	/**
	 * @description Constructor
	 */
	constructor() {
		this._token = window?.localStorage.getItem(this.tokenName) || '';
		this._endpoint = window?.localStorage.getItem(this.endpointName) || import.meta.env.VITE_APP_API_URL || '';
		this._replayDelay = Number(window?.localStorage.getItem(this.replayDelayName)) || 1000;
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

	set replayDelay(x: number) {
		this._replayDelay = x;
		window?.localStorage.setItem(this.replayDelayName, x.toString());
	}
}

export default new SettingService() as SettingService;
