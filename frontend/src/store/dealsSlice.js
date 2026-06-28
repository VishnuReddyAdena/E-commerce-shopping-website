import { createSlice } from '@reduxjs/toolkit';

const dealsSlice = createSlice({
  name: 'deals',
  initialState: {
    items: [
      { label: "Today's Deals", path: "/shop?tag=deal" },
      { label: "Flash Sale", path: "/shop?isFlashSale=true" },
      { label: "Clearance", path: "/shop?tag=clearance" },
      { label: "Coupons", path: "/dashboard?tab=coupons" },
      { label: "Best Sellers", path: "/shop?sortBy=rating" },
      { label: "Trending", path: "/shop?sortBy=trending" }
    ]
  },
  reducers: {
    setDeals: (state, action) => {
      state.items = action.payload || [];
    }
  }
});

export const { setDeals } = dealsSlice.actions;
export default dealsSlice.reducer;
