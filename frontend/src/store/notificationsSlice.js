import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    activeTab: 'All'
  },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload || [];
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    }
  }
});

export const { setNotifications, setActiveTab } = notificationsSlice.actions;
export default notificationsSlice.reducer;
