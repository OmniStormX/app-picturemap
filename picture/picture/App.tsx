/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {Provider as PaperProvider} from 'react-native-paper';
import {MD3LightTheme} from "react-native-paper";
import {
    SafeAreaProvider,
} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import {LoginRegisterScreen} from "./src/pages/login/login.tsx";
import {Provider} from "react-redux";
import {store} from "./src/store";
import {RootStackParamList} from "./src/api/types.ts";
import {HomeTabs} from "./src/navigation/HomeTabs.tsx";

// const Stack = createNativeStackNavigator();
function App() {
    return (
        <Provider store={store}>
            <PaperProvider theme={MD3LightTheme}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <RootStack/>
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
            <Stack.Screen name="login" component={LoginRegisterScreen}/>
            <Stack.Screen name="main" component={HomeTabs}/>
        </Stack.Navigator>
    )
}

export default App;
