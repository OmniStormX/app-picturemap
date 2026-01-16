import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    ActivityIndicator, StyleSheet, Image, Text,
    FlatList // 1. 切换回原生的 FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "../store";
import { fetchPictures } from "../services/picture.ts";
import { addPicture, setLoaded } from "../store/slices/picture.ts";
import { Picture90x160 } from "../components/picture/picture.tsx";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { HomeTabParamList } from "../navigation/tabs.ts";
import { getTagList } from '../api/userService.ts';
import { PictureList } from '../components/picture/pictureList.tsx';
import { RootStackParamList, Tag } from '../api/types.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const PAGE_SIZE = 12;

type Props = BottomTabScreenProps<HomeTabParamList, 'pictures'>
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'tagResult'>;

// screens/Home.tsx
export function Home({ navigation }: Props) {
    const [tags, setTags] = useState<Tag[]>([]);
    useEffect(() => {
        getTagList().then(setTags);
    }, []);

    const renderTagHeader = () => (
        <FlatList
            horizontal
            data={tags}
            showsHorizontalScrollIndicator={false}
            style={styles.tagBar}
            renderItem={({ item }) => (
                <Text
                    style={styles.tagItem}
                    onPress={() => navigation.navigate('tagResult', { tag: item.name })}
                >
                    #{item.name}
                </Text>
            )}
            keyExtractor={item => { 
                console.log('[keyExtractor]: home:', item)
                return item.name 
            }}
        />
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <PictureList
                fetchData={(p, s) => fetchPictures(p, s)}
                ListHeaderComponent={renderTagHeader}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    tagBar: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    tagItem: { paddingHorizontal: 15, paddingVertical: 5, backgroundColor: '#f0f0f0', borderRadius: 15, marginRight: 10, marginLeft: 5 }
});