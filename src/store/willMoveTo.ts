import { IPosition } from '@/game/interfaces';
import { createSlice } from '@reduxjs/toolkit';

const willMoveTo = createSlice({
	name: 'willMoveTo',
	initialState: [] as IPosition[],
	reducers: {
		addPosition: (state, action) => {
			if (state.find((position) => position.x === action.payload.x && position.y === action.payload.y)) {
				state.splice(
					state.findIndex((position) => position.x === action.payload.x && position.y === action.payload.y),
					1,
				);
				return;
			}

			state.push(action.payload);
		},
		removePosition: (state, action) => {
			const index = state.findIndex(
				(position) => position.x === action.payload.x && position.y === action.payload.y,
			);
			if (index !== -1) {
				state.splice(index, 1);
			}
		},
		reset() {
			return [] as IPosition[];
		},
	},
});

export const { addPosition } = willMoveTo.actions;
export default willMoveTo.reducer;
