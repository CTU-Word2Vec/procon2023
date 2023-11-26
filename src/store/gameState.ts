import { GameStateData } from '@/game/classes';
import GameAction from '@/models/GameAction';
import { createSlice } from '@reduxjs/toolkit';

export interface GameStateType {
	gameState: GameStateData | null;
	currentAction: GameAction | null;
}

const gameStateSlice = createSlice({
	name: 'gameState',
	initialState: {
		gameState: null,
		currentAction: null,
	} as GameStateType,
	reducers: {
		setGameState(state, { payload }) {
			return {
				...state,
				gameState: payload,
			};
		},

		setCurrentAction(state, { payload }) {
			return {
				...state,
				currentAction: payload,
			};
		},
	},
});

export const { setGameState, setCurrentAction } = gameStateSlice.actions;
export default gameStateSlice.reducer;
