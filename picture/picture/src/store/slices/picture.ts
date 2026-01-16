import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Picture} from "../../api/types.ts";

interface PictureState {
    pictures: Picture[];
    loaded: Record<number, boolean>; // 改成数组
}

const initialState: PictureState = {
    pictures: [],
    loaded: {

    }
};

export const pictureSlice = createSlice({
    name: 'picture',
    initialState,
    reducers: {
        setPictures: (state, action) => {
            state.pictures = action.payload.pictures;
            for (const pic of action.payload.pictures) {
                state.loaded[pic.pid] = false;
            }
        },
        // 把传入的 Picture 的 ID 加入到 loaded 中
        setLoaded: (state, action: PayloadAction<Picture>) => {
            state.loaded[action.payload.pid] = true;
        },
        setLoadedById: (state, action: PayloadAction<number>) => {
            state.loaded[action.payload] = true;
        },

        addPicture: (state, action: PayloadAction<Picture>) => {
            state.pictures.push(action.payload);
            state.loaded[action.payload.pid] = false;
        },

        clearPictures(state) {
            state.loaded = {};
            state.pictures = [];
        }
    }
})


export const {setPictures, setLoaded, setLoadedById, addPicture, clearPictures} = pictureSlice.actions;
