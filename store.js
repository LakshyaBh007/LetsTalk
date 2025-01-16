// store.js
import { createSlice, configureStore } from '@reduxjs/toolkit';

// Define initial state
const initialState = {
  isLoggedIn: false,
  userId: null,
};

// Create a slice for auth state
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginState: (state, action) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userId = action.payload.userId;
    },
  },
});

// Export the action for dispatching
export const { setLoginState } = authSlice.actions;

// Configure store with the slice
const store = configureStore({
  reducer: {
    auth: authSlice.reducer, // Ensure this is correctly set
  },
});

export default store;
