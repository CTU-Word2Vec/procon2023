import { configureStore } from '@reduxjs/toolkit';
import gameStateReducer from './gameState';
import willMoveToReducer from './willMoveTo';

const store = configureStore({
	reducer: {
		gameState: gameStateReducer,
		willMoveTo: willMoveToReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
