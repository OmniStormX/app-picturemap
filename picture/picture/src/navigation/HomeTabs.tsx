import { Home } from '../pages/home';
import { HomeTabParamList } from './tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Upload} from "./UploadTabs.tsx";
import {useEffect} from "react";
import {useNavigation} from "@react-navigation/core";
import {useDispatch} from "react-redux";
import {clearPictures} from "../store/slices/picture.ts";

const Tab = createBottomTabNavigator<HomeTabParamList>();
export function HomeTabs() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    useEffect(() => {
        // 监听当前 Screen (HomeTabs) 从 Stack 中移除的事件
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            console.log('检测到 Home 堆栈即将销毁 (登出或返回), 执行清理...');
            dispatch(clearPictures());
        });

        return unsubscribe; // 组件卸载时移除监听
    }, [navigation, dispatch]);

    return (
        <Tab.Navigator screenOptions={{ headerShown: false}} initialRouteName="pictures">
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
