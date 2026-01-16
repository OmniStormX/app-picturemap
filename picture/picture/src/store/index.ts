import {configureStore} from "@reduxjs/toolkit";
import {userSlice} from "./slices/userSlice.ts";
import {pictureSlice} from "./slices/picture.ts";


export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        picture: pictureSlice.reducer,
    }
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;