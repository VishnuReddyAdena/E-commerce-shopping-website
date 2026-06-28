import { createSlice } from '@reduxjs/toolkit';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    keyword: '',
    history: [],
    suggestions: [],
    trending: ["iPhone 16 Pro", "Mechanical Keyboard", "MacBook Pro M3", "AuraGlow Lighting Panel", "Calfskin Backpack"],
    matchingProducts: [],
    matchingCategories: [],
    matchingBrands: []
  },
  reducers: {
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setSuggestions: (state, action) => {
      state.suggestions = action.payload;
    },
    setMatchingResults: (state, action) => {
      state.matchingProducts = action.payload.products || [];
      state.matchingCategories = action.payload.categories || [];
      state.matchingBrands = action.payload.brands || [];
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
    addHistoryItem: (state, action) => {
      const term = action.payload;
      if (!term.trim()) return;
      state.history = [term, ...state.history.filter(t => t.toLowerCase() !== term.toLowerCase())].slice(0, 5);
      localStorage.setItem('recent_searches', JSON.stringify(state.history));
    },
    clearHistory: (state) => {
      state.history = [];
      localStorage.setItem('recent_searches', JSON.stringify([]));
    }
  }
});

export const { setKeyword, setSuggestions, setMatchingResults, setHistory, addHistoryItem, clearHistory } = searchSlice.actions;
export default searchSlice.reducer;
