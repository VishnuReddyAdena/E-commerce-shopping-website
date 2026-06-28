import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profileData: null,
    walletBalance: 0,
    loyaltyPoints: 0,
    membershipTier: 'Silver',
    loading: false,
    error: null
  },
  reducers: {
    setProfile: (state, action) => {
      state.profileData = action.payload.profile || null;
      state.walletBalance = action.payload.walletBalance || 0;
      state.loyaltyPoints = action.payload.loyaltyPoints || 0;
      state.membershipTier = action.payload.membershipTier || 'Silver';
      state.loading = false;
      state.error = null;
    },
    setProfileLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProfileError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setProfile, setProfileLoading, setProfileError } = profileSlice.actions;
export default profileSlice.reducer;
