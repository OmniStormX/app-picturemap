import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        borderRadius: 28, // Material 3 Large Shape
    },
    title: {
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
    },
    loginButton: {
        marginTop: 8,
        marginBottom: 8,
    },
    loadingOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.6)',
        zIndex: 1,
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
    }
});
