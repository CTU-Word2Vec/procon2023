import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth';
import gameStateReducer from './gameState';

const store = configureStore({
	reducer: {
		gameState: gameStateReducer,
		auth: authReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
