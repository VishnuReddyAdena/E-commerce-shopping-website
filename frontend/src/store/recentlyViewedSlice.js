import { createSlice } from '@reduxjs/toolkit';

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: {
    items: [] // List of product objects
  },
  reducers: {
    addToRecentlyViewed: (state, action) => {
      // Filter out existing occurrence of this product
      const filtered = state.items.filter(item => item._id !== action.payload._id);
      // Prepend to top and limit to 5
      state.items = [action.payload, ...filtered].slice(0, 5);
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
    }
  }
});

export const { addToRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
