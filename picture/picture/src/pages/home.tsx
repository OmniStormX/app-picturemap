import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    View,
    ActivityIndicator, StyleSheet, Image, Text,
    FlatList // 1. 切换回原生的 FlatList
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from "../store";
import {fetchPictures} from "../services/picture.ts";
import {addPicture, setLoaded} from "../store/slices/picture.ts";
import {Picture90x160} from "../components/picture/picture.tsx";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {HomeTabParamList} from "../navigation/tabs.ts";
import {getImageUrl, getPreviewUrl} from "../services/getPictureUrl.ts";
import FastImage from "react-native-fast-image";

const PAGE_SIZE = 12;

type Props = BottomTabScreenProps<HomeTabParamList, 'pictures'>

export function Home({navigation}: Props) {
    const dispatch = useDispatch();
    const pictures = useSelector(
        (state: RootState) => state.picture.pictures
    );

    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const isFetching = useRef(false);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || isFetching.current) return;

        isFetching.current = true;
        setLoading(true);

        try {
            console.log(`[Network] 正在获取第 ${page} 页...`);
            const list = await fetchPictures(page, PAGE_SIZE);

            if (list.length === 0) {
                setHasMore(false);
                return;
            }

            if (list.length < PAGE_SIZE) setHasMore(false);

            // 分发数据到 Redux
            list.forEach(pic => dispatch(addPicture(pic)));
            setPage(prev => prev + 1);
            // 后台异步预处理图片
            // (async () => {
            // for (const pic of list) {
            //     const previewUrl = getPreviewUrl(pic.name);
            //     await Image.prefetch(previewUrl);
            //     dispatch(setLoaded(pic));
            // }
            // const imageUrls = list.map(pic => ({uri: getImageUrl(pic.name)}));
            // FastImage.preload(imageUrls);
            // })();
        } catch (err) {
            console.log('[Home] Error:', err);
        } finally {
            // 设置一个短暂延迟，防止滚动过快导致的重复触发
            setTimeout(() => {
                setLoading(false);
                isFetching.current = false;
            }, 400);
        }
    }, [page, loading, hasMore, dispatch]);

    // 修复：仅在挂载时运行。如果依赖 loadMore，因其内部依赖 page，
    // 每次翻页会导致 loadMore 引用变化，从而可能触发不必要的 useEffect 执行。
    useEffect(() => {
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderItem = useCallback(({item}: { item: any }) => {
        return <Picture90x160 name={item.name} pid={item.pid}/>;
    }, []);

    const renderFooter = () => {
        if (loading) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color="#666"/>
                    <Text style={styles.footerText}>正在获取更多图片...</Text>
                </View>
            );
        }
        return (!hasMore && pictures.length > 0) ? (
            <View style={styles.footer}>
                <Text style={styles.footerText}>已经到底啦</Text>
            </View>
        ) : null;
    };

    return (
        <View style={{flex: 1, borderColor: '#ffffff', borderWidth: 1, backgroundColor: '#fff', marginLeft: 'auto', marginRight: 'auto'}}>
            <FlatList
                data={pictures}
                renderItem={renderItem}
                keyExtractor={item => item.pid.toString()}
                numColumns={3}

                // --- FlatList 分页优化属性 ---
                onEndReached={loadMore}
                onEndReachedThreshold={0.1} // 距离底部10%时触发

                // --- FlatList 性能优化属性 ---
                removeClippedSubviews={true} // 移除屏幕外组件，释放内存
                initialNumToRender={12}      // 首屏渲染数量
                maxToRenderPerBatch={12}     // 每批次最大渲染数量
                windowSize={7}               // 保持在内存中的窗口大小

                contentContainerStyle={styles.listContainer}
                ListFooterComponent={renderFooter()}
                style={{flex: 1, backgroundColor: '#ffffff'}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 4,
        // 如果想要网格居中，可以在这里调整
        width: '100%',
    },
    footer: {
        paddingVertical: 0,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 8,
    }
});