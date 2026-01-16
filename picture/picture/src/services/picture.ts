import {BaseReply, Picture, PictureListReply} from "../api/types.ts";
import {getPictureList, uploadPicture} from "../api/userService.ts";
import {Asset} from "react-native-image-picker";
// 从服务器获取图片列表
export async function fetchPictures(page: number, pageSize: number): Promise<Picture[]> {
    return getPictureList(page, pageSize).then((data: BaseReply<PictureListReply>) => data.msg.picture_list)
}



// 上传图片
export async function uploadImage(image: Asset): Promise<void> {
    if (!image.uri) {
        throw new Error('图片URI无效');
    }

    return uploadPicture(
        image.fileName || 'image.jpg',
        image.uri
    ).then((res) => {
        console.log('图片上传成功:', res);
    })
        .catch((err) => {
            console.error(err);
        })
}