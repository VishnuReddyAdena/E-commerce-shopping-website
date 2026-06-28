import { createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    setOrders: (state, action) => {
      state.items = action.payload || [];
      state.loading = false;
      state.error = null;
    },
    setOrdersLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOrdersError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setOrders, setOrdersLoading, setOrdersError } = ordersSlice.actions;
export default ordersSlice.reducer;
