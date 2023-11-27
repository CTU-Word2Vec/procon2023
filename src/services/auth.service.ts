import { compare } from 'bcryptjs';

/**
 * @description Auth service
 */
export class AuthService {
	/**
	 * @description Hashed password
	 * @private
	 * @readonly
	 * @type {string}
	 */
	private readonly hashedPassword: string = '$2a$12$6XtAPJSFsFzPbwqVqtyOo.L9Uxd0I5jVMyCCHSnYKTyVC.i5lcZoe';

	/**
	 * @description Login
	 * @param {string} password
	 * @returns {Promise<boolean>}
	 */
	public async login(password: string): Promise<boolean> {
		const valid = await compare(password, this.hashedPassword);

		if (!valid) {
			throw new Error('Unauthorized');
		}

		return true;
	}
}

export default new AuthService() as AuthService;
