import { createSlice } from '@reduxjs/toolkit';

const compareSlice = createSlice({
  name: 'compare',
  initialState: {
    items: [] // List of product objects
  },
  reducers: {
    addToCompare: (state, action) => {
      const exists = state.items.some(item => item._id === action.payload._id);
      if (!exists && state.items.length < 3) {
        state.items.push(action.payload);
      }
    },
    removeFromCompare: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },
    clearCompare: (state) => {
      state.items = [];
    }
  }
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
