import { configureStore } from '@reduxjs/toolkit';
import gameStateReducer from './gameState';
import willBuildOnReducer from './willBuildOn';
import willMoveToReducer from './willMoveTo';

const store = configureStore({
	reducer: {
		gameState: gameStateReducer,
		willMoveTo: willMoveToReducer,
		willBuildOn: willBuildOnReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
