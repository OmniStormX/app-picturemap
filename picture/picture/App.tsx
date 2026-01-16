/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Provider as PaperProvider } from 'react-native-paper';
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

// const Stack = createNativeStackNavigator();
function App() {
    return (
        <Provider store={store}>
            <PaperProvider theme={MD3LightTheme}>
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

function RootStack() {
    return (
        <Stack.Navigator initialRouteName="login">
            <Stack.Screen name="login" component={LoginRegisterScreen} options={{
                title: '登录/注册',
            }} />
            <Stack.Screen name="main" component={HomeTabs} options={{
                title: '图床',
            }} />
            <Stack.Screen name="tagResult" component={TagResult} options={{ title: '搜索结果' }} />
        </Stack.Navigator>
    )
}

export default App;
