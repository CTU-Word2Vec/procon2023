import IHashedType from './IHashedType';
import IPosition from './IPosition';

/**
 * @description Interface cho các đối tượng có thể tăng giảm giá trị của một điểm
 * @extends IHashedType<number>
 */
export default interface HashedType extends IHashedType<number> {
	/**
	 * @description Tăng giá trị của một điểm
	 * @param pos - Điểm cần tăng giá trị
	 * @param value - Giá trị cần tăng
	 */
	increase(pos: IPosition, value: number): void;
	/**
	 * @description Giảm giá trị của một điểm
	 * @param pos - Điểm cần giảm giá trị
	 */
	decrease(pos: IPosition, value: number): void;
}
