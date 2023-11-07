class TokenService {
	private readonly _tokenName = 'token';
	private _token = '';

	constructor() {
		if (typeof window === 'undefined') return;

		this._token = window.localStorage.getItem(this._tokenName) || '';
	}

	get token() {
		return this._token;
	}

	set token(v: string) {
		this._token = v;
		window.localStorage.setItem(this._tokenName, v);
	}
}

export default new TokenService() as TokenService;
