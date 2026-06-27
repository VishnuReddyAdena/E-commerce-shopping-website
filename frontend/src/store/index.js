import { configureStore } from '@reduxjs/toolkit';
import compareReducer from './compareSlice.js';
import recentlyViewedReducer from './recentlyViewedSlice.js';

export const store = configureStore({
  reducer: {
    compare: compareReducer,
    recentlyViewed: recentlyViewedReducer
  }
});
export default store;
