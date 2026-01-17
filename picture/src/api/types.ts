/* Picture 与后端 modal/picture 对齐 */
export interface Picture {
    pid: number;
    name: string;
    url: string;     // 图片的 URL
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

export interface UploadImage {
    uri: string;
    name: string;
    size: number;
    type: string;
}

export interface UploadImageReply {
    message: string;
}

/* 标签相关 */
export interface Tag {
    name: string;
    count: number;
}

/* 请求和回复类型 */
export interface GetListByTagRequest {
    tag: string;
    page: number;
    pageSize: number;
}

export interface GetListByTagReply {
    picture_list: Picture[];
}

export interface GetTagListRequest {
    page: number;
    pageSize: number;
}

export interface TagListReply {
    tag_list: Tag[];
}

/* File 上传 */
export interface UploadFile {
    uri: string;
    name: string;
    type: string;
    size: number;
}

/* Base Reply */
export interface BaseReply<T> {
    status: string;
    msg: T;
}

/* React Navigation 类型 */
export type RootStackParamList = {
    login: undefined;
    main: undefined;
    tagResult: { tag: string };
};

/* Gallery Image */
export interface GalleryImageObject {
    id: number;
    caption: string;
    url: string;
}

/* PictureList 组件的 Props */
export interface PictureListProps {
    fetchData: (page: number, pageSize: number) => Promise<any[]>;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    setTagList?: (tags: Tag[]) => void;
}

export interface PictureReceive {
    pid: number;
    name: string;
    hash: string;
}


export interface UploadImageRequest {
    tags: string[];
    name: string;
}