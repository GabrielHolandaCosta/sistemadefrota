import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  role: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  username: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(
      state,
      action: PayloadAction<{ access: string; refresh: string }>,
    ) {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
    setUser(
      state,
      action: PayloadAction<{ username: string; role: string | null }>,
    ) {
      state.username = action.payload.username;
      state.role = action.payload.role;
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
      state.role = null;
    },
  },
});

export const { setTokens, setUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;


