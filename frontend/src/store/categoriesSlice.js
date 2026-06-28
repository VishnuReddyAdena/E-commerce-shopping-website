import { createSlice } from '@reduxjs/toolkit';

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: []
  },
  reducers: {
    setCategories: (state, action) => {
      state.items = action.payload || [];
    }
  }
});

export const { setCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
