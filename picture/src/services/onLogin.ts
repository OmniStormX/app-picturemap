import {login} from "../api/userService.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function onLogin(username: string, password: string, setLoading: (loading: boolean) => void, showError: (error: string) => void) {
    try {
        await login(username, password)
            .then(data => {
                console.log(data);
                AsyncStorage.setItem('token', data.msg.token);
                AsyncStorage.setItem('username', username);

                setLoading(false)
                return data;
            })
        .catch(error => {
            console.log(error);
            setLoading(false)
            throw error;
        })
    } catch (error) {
        if (error instanceof Error) {
            showError(error.toString());
            console.log('Api failed:' + error);
        } else {
            showError("未知登录错误。");
            console.log('Api failed :(' + error);
        }
        setLoading(false)
    }
}