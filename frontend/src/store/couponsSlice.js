import { createSlice } from '@reduxjs/toolkit';

const couponsSlice = createSlice({
  name: 'coupons',
  initialState: {
    available: [],
    used: [],
    expired: [],
    loading: false,
    error: null
  },
  reducers: {
    setCoupons: (state, action) => {
      state.available = action.payload.available || [];
      state.used = action.payload.used || [];
      state.expired = action.payload.expired || [];
      state.loading = false;
      state.error = null;
    },
    setCouponsLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setCoupons, setCouponsLoading } = couponsSlice.actions;
export default couponsSlice.reducer;
