import { IPosition } from '@/game/interfaces';
import { createSlice } from '@reduxjs/toolkit';

const willMoveTo = createSlice({
	name: 'willMoveTo',
	initialState: () => {
		window.localStorage.setItem('willMoveTo', JSON.stringify([]));

		return [] as IPosition[];
	},
	reducers: {
		addPosition: (state, action) => {
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
		removePosition: (state, action) => {
			const index = state.findIndex(
				(position) => position.x === action.payload.x && position.y === action.payload.y,
			);
			if (index !== -1) {
				state.splice(index, 1);
			}

			window.localStorage.setItem('willMoveTo', JSON.stringify(state));
		},
		reset() {
			window.localStorage.setItem('willMoveTo', JSON.stringify([]));

			return [] as IPosition[];
		},
	},
});

export const { addPosition, removePosition, reset } = willMoveTo.actions;
export default willMoveTo.reducer;
