import { IPosition } from '@/game/interfaces';
import { createSlice } from '@reduxjs/toolkit';

const willMoveTo = createSlice({
	name: 'willMoveTo',
	initialState: () => {
		window.localStorage.setItem('willMoveTo', JSON.stringify([]));

		return [] as IPosition[];
	},
	reducers: {
		addMovePosition: (state, action) => {
			if (state.find((position) => position.x === action.payload.x && position.y === action.payload.y)) {
				state.splice(
					state.findIndex((position) => position.x === action.payload.x && position.y === action.payload.y),
					1,
				);

				window.localStorage.setItem('willMoveTo', JSON.stringify(state));
				return;
			}

			state.push(action.payload);

			window.localStorage.setItem('willMoveTo', JSON.stringify(state));
		},
		removeMovePosition: (state, action) => {
			const index = state.findIndex(
				(position) => position.x === action.payload.x && position.y === action.payload.y,
			);
			if (index !== -1) {
				state.splice(index, 1);
			}

			window.localStorage.setItem('willMoveTo', JSON.stringify(state));
		},
		resetMovePosition() {
			window.localStorage.setItem('willMoveTo', JSON.stringify([]));

			return [] as IPosition[];
		},
	},
});

export const { addMovePosition, removeMovePosition, resetMovePosition } = willMoveTo.actions;
export default willMoveTo.reducer;
