import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  username: string | null;
  role: string | null;
};

// Carregar estado inicial do localStorage
function loadInitialState(): AuthState {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        username: parsed.username || null,
        role: parsed.role || null,
      };
    }
  } catch (error) {
    console.error("Erro ao carregar auth do localStorage:", error);
  }
  return {
    accessToken: null,
    refreshToken: null,
    username: null,
    role: null,
  };
}

const initialState: AuthState = loadInitialState();

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
      // Salvar no localStorage
      try {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            username: state.username,
            role: state.role,
          })
        );
      } catch (error) {
        console.error("Erro ao salvar auth no localStorage:", error);
      }
    },
    setUser(
      state,
      action: PayloadAction<{ username: string; role: string | null }>,
    ) {
      state.username = action.payload.username;
      state.role = action.payload.role;
      // Salvar no localStorage
      try {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            username: state.username,
            role: state.role,
          })
        );
      } catch (error) {
        console.error("Erro ao salvar auth no localStorage:", error);
      }
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.username = null;
      state.role = null;
      // Limpar localStorage
      try {
        localStorage.removeItem("auth");
      } catch (error) {
        console.error("Erro ao limpar auth do localStorage:", error);
      }
    },
  },
});

export const { setTokens, setUser, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;


