import { IHashedCounter } from '../interfaces';
import HashedType from './HashedType';
import Position from './Position';

export default class HashedCounter extends HashedType<number> implements IHashedCounter {
	public increase(pos: Position, value: number = 1): void {
		if (!this.exist(pos)) this.write(pos, value);
		else this.write(pos, this.read(pos)! + value);
	}

	public decrease(pos: Position, value: number = 1): void {
		if (!this.exist(pos)) this.write(pos, -value);
		else this.write(pos, this.read(pos)! - value);
	}

	public override read(pos: Position): number {
		return super.read(pos) ?? 0;
	}
}
