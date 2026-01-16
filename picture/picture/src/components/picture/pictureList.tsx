// components/PictureList.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Picture90x160 } from './picture';
import { PictureListProps, PictureReceive } from '../../api/types';


export function PictureList({ fetchData, ListHeaderComponent }: PictureListProps) {
    const [data, setData] = useState<PictureReceive[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isFetching = useRef(false);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || isFetching.current) return;
        isFetching.current = true;
        setLoading(true);

        try {
            const list = await fetchData(page, 12);
            if (list.length < 12) setHasMore(false);
            setData(prev => [...prev, ...list]);
            setPage(prev => prev + 1);
        } catch (err) {
            console.error(err);
        } finally {
            setTimeout(() => {
                setLoading(false);
                isFetching.current = false;
            }, 400);
        }
    }, [page, loading, hasMore, fetchData]);

    useEffect(() => { loadMore(); }, []);

    const renderFooter = () => (
        <View style={styles.footer}>
            {loading ? <ActivityIndicator size="small" /> : (hasMore ? null : <Text>没有更多了</Text>)}
        </View>
    );

   const keyExtractor = (item: PictureReceive, index: number) => {
        // 安全的 key extractor 实现
        console.log(item);
        if (!item) return `tag-${index}`;
        if (item && typeof item === 'object' && 'pid' in item) {
            return item.pid !== undefined ? item.pid.toString() : `tag-${index}`;
        }
        return `tag-${index}`;
    };


    return (
        <FlatList
            data={data}
            renderItem={({ item }) => <Picture90x160 name={item.name} pid={item.pid} />}
            keyExtractor={keyExtractor}
            numColumns={3}
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={renderFooter}
        />
    );
}

const styles = StyleSheet.create({ footer: { padding: 20, alignItems: 'center' } });