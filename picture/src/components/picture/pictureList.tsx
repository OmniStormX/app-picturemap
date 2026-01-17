import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet, RefreshControl } from 'react-native';
import { PictureListProps, PictureReceive } from '../../api/types';
import { useTheme } from 'react-native-paper'; // 用于获取天青色主题
import { Picture90x160 } from './picture';
import { get } from 'react-native/Libraries/NativeComponent/NativeComponentRegistry';
import { getTagList } from '../../api/userService';

export function PictureList({ fetchData, ListHeaderComponent, setTagList }: PictureListProps) {
    const theme = useTheme();
    const [data, setData] = useState<PictureReceive[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false); // 控制下拉刷新状态
    const [hasMore, setHasMore] = useState(true);
    const isFetching = useRef(false);

    // 统一的请求逻辑，isRefresh 判断是追加还是重置
    const requestData = useCallback(async (targetPage: number, isRefresh: boolean = false) => {
        if (isFetching.current) return;
        isFetching.current = true;
        if (!isRefresh) setLoading(true);

        try {
            const list = await fetchData(targetPage, 12);
            
            if (isRefresh) {
                // 如果是刷新，直接替换数据，重置页码
                setData(list);
                setHasMore(list.length >= 12);
                setPage(2);
                await getTagList().then(setTagList);
            } else {
                // 如果是分页，追加数据
                if (list.length < 12) setHasMore(false);
                setData(prev => [...prev, ...list]);
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error('[PictureList] Error:', err);
        } finally {
            // 稍微延迟关闭 loading 增加视觉丝滑感
            setTimeout(() => {
                setLoading(false);
                setRefreshing(false);
                isFetching.current = false;
            }, 400);
        }
    }, [fetchData]);

    // 下拉刷新逻辑
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        requestData(1, true); // 请求第一页
    }, [requestData]);

    // 触底加载逻辑
    const loadMore = () => {
        if (!loading && hasMore && !refreshing) {
            requestData(page);
        }
    };

    // 初始加载
    useEffect(() => {
        requestData(1);
    }, []);

    const renderFooter = () => (
        <View style={styles.footer}>
            {loading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
                hasMore ? null : <Text style={styles.noMoreText}>没有更多了</Text>
            )}
        </View>
    );

    const keyExtractor = (item: PictureReceive, index: number) => {
        if (!item) return `empty-${index}`;
        return item.pid !== undefined ? item.pid.toString() : `idx-${index}`;
    };

    return (
        <FlatList
            data={data}
            renderItem={({ item }) => <Picture90x160 name={item.name} pid={item.pid} />}
            keyExtractor={keyExtractor}
            style={{ backgroundColor: theme.colors.background }}
            contentContainerStyle={{ paddingHorizontal: 10 }} // 添加左右 padding
            numColumns={3}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={renderFooter}
            // --- 添加下拉刷新控制 ---
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]} // Android 天青色
                    tintColor={theme.colors.primary} // iOS 天青色
                />
            }
        />
    );
}

const styles = StyleSheet.create({ 
    footer: { padding: 20, alignItems: 'center' },
    noMoreText: { color: '#999', fontSize: 12 }
});