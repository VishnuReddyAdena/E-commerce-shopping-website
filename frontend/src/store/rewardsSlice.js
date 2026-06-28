import { createSlice } from '@reduxjs/toolkit';

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: {
    points: 0,
    tier: 'Silver',
    history: [],
    achievements: [],
    loading: false
  },
  reducers: {
    setRewards: (state, action) => {
      state.points = action.payload.points || 0;
      state.tier = action.payload.tier || 'Silver';
      state.history = action.payload.history || [];
      state.achievements = action.payload.achievements || [];
      state.loading = false;
    },
    setRewardsLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setRewards, setRewardsLoading } = rewardsSlice.actions;
export default rewardsSlice.reducer;
