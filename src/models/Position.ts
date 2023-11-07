export default interface Position {
	x: number;
	y: number;
}

export interface CraftsmenPosition extends Position {
	id: string;
	side: 'A' | 'B';
}
