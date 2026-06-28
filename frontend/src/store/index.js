import { configureStore } from '@reduxjs/toolkit';
import compareReducer from './compareSlice.js';
import recentlyViewedReducer from './recentlyViewedSlice.js';
import authReducer from './authSlice.js';
import searchReducer from './searchSlice.js';
import wishlistReducer from './wishlistSlice.js';
import cartReducer from './cartSlice.js';
import notificationsReducer from './notificationsSlice.js';
import currencyReducer from './currencySlice.js';
import categoriesReducer from './categoriesSlice.js';
import dealsReducer from './dealsSlice.js';
import ordersReducer from './ordersSlice.js';
import couponsReducer from './couponsSlice.js';
import rewardsReducer from './rewardsSlice.js';
import profileReducer from './profileSlice.js';

export const store = configureStore({
  reducer: {
    compare: compareReducer,
    recentlyViewed: recentlyViewedReducer,
    auth: authReducer,
    search: searchReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    notifications: notificationsReducer,
    currency: currencyReducer,
    categories: categoriesReducer,
    deals: dealsReducer,
    orders: ordersReducer,
    coupons: couponsReducer,
    rewards: rewardsReducer,
    profile: profileReducer
  }
});

export default store;
