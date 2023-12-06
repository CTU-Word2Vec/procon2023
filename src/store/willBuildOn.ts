import { IPosition } from '@/game/interfaces';
import { createSlice } from '@reduxjs/toolkit';

const willBuildOn = createSlice({
	name: 'willBuildOn',
	initialState: [] as IPosition[],
	reducers: {
		addBuildPosition: (state, action) => {
			if (state.find((position) => position.x === action.payload.x && position.y === action.payload.y)) {
				state.splice(
					state.findIndex((position) => position.x === action.payload.x && position.y === action.payload.y),
					1,
				);

				window.localStorage.setItem('willBuildOn', JSON.stringify(state));
				return;
			}

			state.push(action.payload);

			window.localStorage.setItem('willBuildOn', JSON.stringify(state));
		},
		removeBuildPosition: (state, action) => {
			const index = state.findIndex(
				(position) => position.x === action.payload.x && position.y === action.payload.y,
			);
			if (index !== -1) {
				state.splice(index, 1);
			}

			window.localStorage.setItem('willBuildOn', JSON.stringify(state));
		},
		resetBuildPosition() {
			window.localStorage.setItem('willBuildOn', JSON.stringify([]));

			return [] as IPosition[];
		},
	},
});

export const { addBuildPosition, removeBuildPosition, resetBuildPosition } = willBuildOn.actions;

export default willBuildOn.reducer;
