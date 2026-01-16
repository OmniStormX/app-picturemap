import {View} from "react-native";
import {Button, Text, TextInput} from "react-native-paper";
import {useState} from "react";
import {uploadImage} from "../services/picture.ts";
import {Asset, launchImageLibrary} from 'react-native-image-picker';

export function Upload() {
    const [image, setImage] = useState<null | Asset>(null);
    const [title, setTitle] = useState('');
    const [upload, setUpload] = useState<boolean>(false);

    const pickImage: () => Promise<Asset> = async () => {
        return new Promise((resolve, reject) => {
            launchImageLibrary({
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
            }, (response) => {
                if (response.didCancel) {
                    reject(new Error('用户取消了选择'));
                } else if (response.errorCode) {
                    reject(new Error(response.errorMessage));
                } else if (response.assets && response.assets[0]) {
                    resolve(response.assets[0]);
                } else {
                    reject(new Error('没有选择图片'));
                }
            });
        });
    }

    const onSelect = async () => {
        try {
            const img: Asset= await pickImage();
            if (img) {
                setImage(img);
                setTitle(img.fileName || 'untitled');
            }
        } catch (error) {
            console.log('选择图片错误:', error);
        }
    };

    const onSubmit = async () => {
        if (!image) return;
        setUpload(true);
        uploadImage(image)
            .then(() => {
                setUpload(false);
            })
            .catch((error) => {
                console.log('[Upload] Error:', error);
                setUpload(false);
            })
    };

    return (
        <View>
            <Button onPress={onSelect}>选择图片</Button>
            {image && <Text>{image.fileName}</Text>}
            <TextInput value={title} onChangeText={setTitle} placeholder="标题"/>
            <Button onPress={onSubmit} disabled={upload}>上传</Button>
        </View>
    );
}