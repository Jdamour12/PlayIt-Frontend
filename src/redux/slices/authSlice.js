import {createSlice} from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set loading state during API calls (login, register, fetch user)
        setLoading: (state, action) => {
            state.isLoading = action.payload;
            state.error = null;
        },

        // Set user after successfully login/register/fetch user
        // Also store token in local storage for persistence
        setUser: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;

            if(action.payload.token) localStorage.setItem('token', action.payload.token);
        },

        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },

        // Logout - clear all auth states and remove token from the local storage
        logout: (state, action) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem('token');
        },

        updateFavorites: (state, action) => {
            if(state.user) {
                state.user.favorites = action.payload;
            }
        },

        clearError: (state) => {
            state.error = null;
        }
    }
});

export const {
    setLoading, 
    setError, 
    setUser, 
    logout, 
    updateFavorites, 
    clearError
} = authSlice.actions;

export default authSlice.reducer;