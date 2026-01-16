// src/api/types.ts

/* Picture 与后端 modal/picture 对齐 */
export interface Picture {
    pid: number;
    name: string;
    created_at?: string;
}

/* 通用错误 */
export interface ErrorReply {
    error: string;
}

/* 登录 / 注册 */
export interface LoginReply {
    status: string;
    username: string;
    token: string;
}

export interface RegisterReply {
    status: string;
    username: string;
    token: string;
}

/* 图片列表 */
export interface PictureListReply {
    picture_list: Picture[];
}

/* 上传 */
export interface UploadReply {
    message: string;
}


export interface RegisterReply {
    status: string;
    token: string;
}

export interface BaseReply<T> {
    status: string;
    msg: T;
}

export type RootStackParamList = {
    login: undefined;
    main: undefined;
};

export type UploadImage = {
    uri: string;
    name: string;
    size: number;
    type: string;
};

export interface UploadImageReply {
    message: string;
}

export interface GalleryImageObject {
    id: number;
    caption: string;
    url: string;
}