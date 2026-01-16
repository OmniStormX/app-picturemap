// src/api/userApi.ts

import { request } from "./http";
import {
    BaseReply,
    LoginReply,
    PictureListReply, RegisterReply, UploadImageReply,
} from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ========== Auth ========== */
export function register(username: string, password: string) {
    return request<BaseReply<RegisterReply>>("/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export function login(username: string, password: string) {
    return request<BaseReply<LoginReply>>("/login", {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
            login_by_token: false,
        }),
    });
}

export async function loginByToken(username: string) {
    const token = await AsyncStorage.getItem("token") || "";
    return request<BaseReply<LoginReply>>("/login", {
        method: "POST",
        body: JSON.stringify({
            login_by_token: true,
            username,
            token,
        }),
    });
}

/* ========== Picture ========== */
// 从 AsyncStorage 中获取 token
export async function getPictureList(page: number, pageSize: number) {
    return request<BaseReply<PictureListReply>>("/protected/list", {
        method: "POST",
        body: JSON.stringify({ page, pageSize }),
    });
}

export async function uploadPicture(fileName: string, fileUri: string) {
    const formData = new FormData();
    console.log("[uploadPicture] fileUri", fileUri);
    formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: "image/jpeg",
    } as any);

    return await request<BaseReply<UploadImageReply>>("/protected/upload", {
        method: "POST",
        // @ts-ignore
        body: formData,
    })
}

// export function downloadPicture(token: string, filename: string) {
//     const url = `${BaseUrl}/protected/download?filename=${encodeURIComponent(
//         filename
//     )}`;
//
//     return fetch(url, {
//         method: "GET",
//         headers: {
//             Authorization: token,
//         },
//     }).then((res) => {
//         if (!res.ok) throw new Error("download failed");
//         return res.blob();
//     });
// }
