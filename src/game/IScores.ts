/**
 * @description Scores of a side
 */
export default interface IScores {
	/**
	 * @description Walls score
	 */
	walls: number;

	/**
	 * @description Territories score
	 */
	territories: number;

	/**
	 * @description Castles score
	 */
	castles: number;

	/**
	 * @description Total scores (walls + territories + castles)
	 */
	total: number;
}
