/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Appbar, Provider as PaperProvider } from 'react-native-paper';
import { MD3LightTheme } from "react-native-paper";
import {
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { LoginRegisterScreen } from "./src/pages/login/login.tsx";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { RootStackParamList } from "./src/api/types.ts";
import { HomeTabs } from "./src/navigation/HomeTabs.tsx";
import { TagResult } from './src/navigation/tagResults.tsx';
import { theme } from './theme.ts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const getCustomTitle = (options: any, routeName: string) => {
    return options.headerTitle !== undefined
        ? options.headerTitle
        : options.title !== undefined
        ? options.title
        : routeName;
};
// const Stack = createNativeStackNavigator();
function App() {
    return (
        <Provider store={store}>
            <PaperProvider theme={theme}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <RootStack />
                    </NavigationContainer>
                </SafeAreaProvider>
            </PaperProvider>
        </Provider>
    );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function CustomNavigationBar({ navigation, route, options, back }: any) {
  const title = getCustomTitle(options, route.name);

  return (
    <Appbar.Header mode="center-aligned" elevated>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={title} titleStyle={{ fontSize: 20, fontWeight: 'bold' }} />
    </Appbar.Header>
  );
}

function RootStack() {
    const [isLoading, setIsLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<'login' | 'main'>('login');

    useEffect(() => {
        const checkToken = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (token !== null) {
                    setInitialRoute('main');
                } else {
                    setInitialRoute('login');
                }
            } catch (error) {
                console.error('Error checking token:', error);
                setInitialRoute('login'); // 默认跳转到登录页
            } finally {
                setIsLoading(false);
            }
        };

        checkToken();
    }, []);

    if (isLoading) {
        // 可以返回一个加载界面
        return null;
    }

    return (
        <Stack.Navigator 
            initialRouteName="login"
            screenOptions={{
                header: (props) => <CustomNavigationBar {...props} />,
            }}
        >
            <Stack.Screen name="login" component={LoginRegisterScreen} options={{ title: '欢迎回来' }} />
            <Stack.Screen name="main" component={HomeTabs} options={{ title: '我的图库' }} />
            <Stack.Screen name="tagResult" component={TagResult} options={{ title: '搜索结果' }} />
        </Stack.Navigator>
    )
}

export default App;
