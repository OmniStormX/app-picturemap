import * as React from 'react';
import {
    Card,
    Text,
    TextInput,
    Button,
    Surface, ActivityIndicator,
} from 'react-native-paper';
import {styles} from "./loginPage.tsx";
import {onLogin} from "../../services/onLogin.ts";
import {onRegister} from "../../services/onRegister.ts";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../api/types.ts";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, 'login'>


export function LoginRegisterScreen({navigation}: Props) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [secure, setSecure] = React.useState(true);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isRegister, setIsRegister] = React.useState(false);

    const clearInput = () => {
        setUsername('');
        setPassword('');
    };

    const showError = (msg: string) => {
        setError(msg);
        setTimeout(() => setError(null), 5000);
    };

    const navigateToHome = () => {
        navigation.navigate('main');
    }

    const handleSubmit = () => {
        setLoading(true);

        if (isRegister) {
            onRegister(username, password, setLoading, showError, () => {
                clearInput();
                setIsRegister(false);
            });
        } else {
            onLogin(username, password, setLoading, showError).then(() => {
                    AsyncStorage.getItem('token').then(token => {
                        if (token) {
                            navigateToHome();
                        }
                    })
                }
            )
        }
    };


    if (loading) {
        return (
            <Surface style={styles.loadingOverlay}>
                <ActivityIndicator animating/>
            </Surface>
        );
    }


    return (
        <Surface style={styles.container}>
            <Card mode="elevated" style={styles.card}>
                <Card.Content>
                    <Text variant="headlineMedium" style={styles.title}>
                        {isRegister ? '注册' : '登录'}
                    </Text>

                    <TextInput
                        label="用户名"
                        mode="outlined"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        style={styles.input}
                    />

                    <TextInput
                        label="密码"
                        mode="outlined"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={secure}
                        right={
                            <TextInput.Icon
                                icon={secure ? 'eye-off' : 'eye'}
                                onPress={() => setSecure(!secure)}
                            />
                        }
                        style={styles.input}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        style={styles.loginButton}
                    >
                        {isRegister ? '注册' : '登录'}
                    </Button>

                    {error && <Error err={error}/>}

                    <Button
                        mode="text"
                        onPress={() => {
                            clearInput();
                            setError(null);
                            setIsRegister(!isRegister);
                        }}
                    >
                        {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
                    </Button>
                </Card.Content>
            </Card>
        </Surface>
    );
}


function Error({err}: { err: string }) {
    return <Card style={{marginTop: 16}}>
        <Card.Content>
            <Text variant="bodyMedium" style={{color: '#B3261E'}}>
                {err}
            </Text>
        </Card.Content>
    </Card>
}
