import {Animated, Image, StyleSheet, TouchableOpacity, View} from "react-native";
import {useEffect, useRef, useState} from "react";
import {PictureDetail} from "./pictureDetail.tsx";
import {BaseUrl} from "../../config.ts";
import {useDispatch, useSelector} from "react-redux";
import {getImageUrl, getPlaceholderUrl, getPreviewUrl} from "../../services/getPictureUrl.ts";
import FastImage from "react-native-fast-image";
import {setLoaded, setLoadedById} from "../../store/slices/picture.ts";


export function Picture90x160({name, pid}: { name: string, pid: number }) {
    const [showDetail, setShowDetail] = useState(false);
    const opacity = useRef(new Animated.Value(0)).current;
    const loaded = useSelector((state: any) => state.picture.loaded[pid]);
    const dispatch = useDispatch();
    const placeholderUrl = getPlaceholderUrl(name);
    const previewUrl = getPreviewUrl(name);
    const detailUrl = getImageUrl(name);
    // console.log("previewUrl", previewUrl);
    // console.log("placeholderUrl", placeholderUrl);

    useEffect(() => {
        if (loaded) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
        Image.prefetch(previewUrl).then(() => {
            dispatch(setLoadedById(pid));
        })
    }, [dispatch, loaded, opacity, pid, previewUrl]);
    

    return (
        <>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                    setShowDetail(true)
                }}
            >
                <View style={styles.container}>
                    {/* 马赛克占位图 */}
                    <Image
                        source={{uri: placeholderUrl}}
                        style={[styles.image, {zIndex: 0}]}
                        blurRadius={1}
                    />

                    {/* 高清图淡入 */}
                    {loaded && (
                        <Animated.Image
                            source={{uri: previewUrl}}
                            style={[styles.image, {opacity, zIndex: 1}]}
                        />
                    )}
                </View>
            </TouchableOpacity>

            {/* 全屏详情 */}
            <PictureDetail
                visible={showDetail}
                name={name}
                onClose={() => {
                    setShowDetail(false)
                }}
            />
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        width: 120,
        height: 214,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#ccc', // 增加背景色防止加载前闪白
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 5,
        marginRight: 5,
    },
    image: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
});