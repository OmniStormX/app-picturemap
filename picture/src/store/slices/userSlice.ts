import { createSlice } from "@reduxjs/toolkit";


interface UserState {
    username: string
    token: string | null
}


const initialState: UserState = {
    username: '',
    token: null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.username = action.payload.username;
            state.token = action.payload.token;
        },

        setUsername: (state, action) => {
            state.username = action.payload.username;
        },

        setToken: (state, action) => {
            state.token = action.payload.token;
        },

        clearUser: (state) => {
            state.username = '';
            state.token = null;
        }
    }
})

export const { setUser, clearUser } = userSlice.actions;
