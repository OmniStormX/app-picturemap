import { useEffect } from "react";
import { PictureList } from "../components/picture/pictureList";
import { View } from "react-native";
import { getPictureListByTag } from "../api/userService";
// screens/TagResult.tsx
export function TagResult({ route, navigation }: any) {
    const { tag } = route.params;

    useEffect(() => {
        navigation.setOptions({ title: `标签: ${tag}` });
    }, [tag]);

    return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
            <PictureList 
                fetchData={(p, s) => getPictureListByTag(tag, p, s)} 
            />
        </View>
    );
}