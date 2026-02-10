import {createSlice} from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        authModelOpen: false,
        authModel: "login", // login/signup/forgot
    },
    reducers: {
        openAuthModel: (state, action) => {
            state.authModelOpen = true;
            state.authModel = action.payload || 'login';
        },
        closeAuthModel: (state, action) => {
            state.authModelOpen = false,
            state.authModel = 'login'
        },
        switchAuthModel: (state, action) => {
            state.authModel = action.payload;
        }
    }
});

export const {openAuthModel, closeAuthModel, switchAuthModel} = uiSlice.actions;

export default uiSlice.reducer;