import { request } from "../api/http.ts";
import {BaseReply, Picture, PictureListReply, UploadImageReply} from "../api/types.ts";
import {getPictureList, uploadPicture} from "../api/userService.ts";
import {Asset} from "react-native-image-picker";
// 从服务器获取图片列表
export async function fetchPictures(page: number, pageSize: number): Promise<Picture[]> {
    return getPictureList(page, pageSize).then((data: BaseReply<PictureListReply>) => data.msg.picture_list)
}


export async function uploadImage(
    image: Asset, 
    name: string, 
    tags: string[]
): Promise<void> {
    if (!image.uri) {
        throw new Error('图片URI无效');
    }

    // 将 UI 传来的参数传递给基础服务层
    return uploadPicture(
        image.fileName || 'image.jpg',
        image.uri,
        name,
        tags
    ).then((res) => {
        console.log('图片上传成功:', res);
        if (res.status !== "success") {
            throw new Error(res.msg.message || '上传失败');
        }
    }).catch((err) => {
        console.error('业务层上传错误:', err);
        throw err; // 继续抛出让 UI 层捕获
    });
}
