import { Home } from '../pages/home';
import { HomeTabParamList } from './tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Upload} from "./UploadTabs.tsx";
import React, {useEffect} from "react";
import {useNavigation} from "@react-navigation/core";
import {useDispatch} from "react-redux";
import {clearPictures} from "../store/slices/picture.ts";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme.ts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<HomeTabParamList>();
export function HomeTabs() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    useEffect(() => {
        // 监听当前 Screen (HomeTabs) 从 Stack 中移除的事件
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            console.log('检测到 Home 堆栈即将销毁 (登出或返回), 执行清理...');
            dispatch(clearPictures());
            AsyncStorage.removeItem('token');
        });

        return unsubscribe; // 组件卸载时移除监听
    }, [navigation, dispatch]);

    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
                headerShown: false,
                // --- 底部栏整体样式 ---
                tabBarStyle: {
                    backgroundColor: theme.colors.surface, // 使用主题表面色
                    borderTopWidth: 0,                    // 去掉顶部分割线，更现代
                    elevation: 10,                        // Android 阴影
                    height: 65,                           // 稍微加高一点
                    paddingBottom: 10,
                },
                // --- 颜色配置 ---
                tabBarActiveTintColor: theme.colors.primary,   // 激活时天青色
                tabBarInactiveTintColor: theme.colors.outline, // 未激活时灰色
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                // --- 图标配置 ---
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = '';
                    if (route.name === 'pictures') {
                        // 激活时用填充图标，未激活用空心图标，符合 MD3 规范
                        iconName = focused ? 'image-multiple' : 'image-multiple-outline';
                    } else if (route.name === 'upload') {
                        iconName = focused ? 'plus-circle' : 'plus-circle-outline';
                    }
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
            })}
            initialRouteName="pictures">
            <Tab.Screen
                name="pictures"
                component={Home}
                options={{ title: '图片' }}
            />
            <Tab.Screen
                name="upload"
                component={Upload}
                options={{ title: '上传' }}
            />
        </Tab.Navigator>
    );
}
