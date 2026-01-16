import {register} from "../api/userService.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function onRegister(
    username: string,
    password: string,
    setLoading: (v: boolean) => void,
    showError: (msg: string) => void,
    onSuccess: () => void,
) {
    try {
        if (!username || !password) {
            throw new Error('用户名和密码不能为空');
        }

        await register(username, password)
            .then(data => {
              console.log(data);
                AsyncStorage.setItem('token', data.msg.token);
                AsyncStorage.setItem('username', username);
                return data;
            })
        .catch(error => {
            console.log(error);
            throw error;
        })


        onSuccess();
    } catch (error: unknown) {
        showError(
            error instanceof Error ? error.message : '注册失败'
        );
    } finally {
        setLoading(false);
    }
}
