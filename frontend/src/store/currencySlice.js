import { createSlice } from '@reduxjs/toolkit';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currency: 'INR',
    country: 'India'
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setCountry: (state, action) => {
      state.country = action.payload;
    }
  }
});

export const { setCurrency, setCountry } = currencySlice.actions;
export default currencySlice.reducer;
