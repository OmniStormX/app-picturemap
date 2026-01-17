import React, { useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import {
    TextInput,
    Button,
    Text,
    Card,
    Chip,
    useTheme,
    ActivityIndicator,
    Surface,
    IconButton
} from 'react-native-paper';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
// 模拟点击预览图
import { TouchableOpacity } from 'react-native';
import { uploadImage } from '../services/picture.ts';


export function Upload() {
    const theme = useTheme();
    const [image, setImage] = useState<null | Asset>(null);
    const [name, setName] = useState('');
    const [tagInput, setTagInput] = useState(''); // 当前正在输入的 tag
    const [tags, setTags] = useState<string[]>([]); // 已添加的 tags 数组
    const [uploading, setUploading] = useState<boolean>(false);

    // --- 选择图片 ---
    const onSelect = async () => {
        launchImageLibrary({
            mediaType: 'photo',
            includeBase64: false,
            quality: 0.8,
        }, (response) => {
            if (response.assets && response.assets[0]) {
                const img = response.assets[0];
                setImage(img);
                // 默认图片名去掉后缀
                const defaultName = img.fileName ? img.fileName.replace(/\.[^/.]+$/, "") : 'image';
                setName(defaultName);
            }
        });
    };

    // --- 添加 Tag ---
    const addTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    // --- 删除 Tag ---
    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    // --- 提交上传 ---
    const onSubmit = async () => {
        if (!image) {
            Alert.alert('提示', '请先选择一张图片');
            return;
        }
        if (!name.trim()) {
            Alert.alert('提示', '请输入图片名称');
            return;
        }

        setUploading(true);

        try {
            // 注意：这里需要配合你后端的接收逻辑
            // 通常是 FormData，其中包含 file, tags[], name
            const result = await uploadImage(image, name, tags);
            Alert.alert('成功', '图片上传成功');
            // 重置状态
            setImage(null);
            setName('');
            setTags([]);
        } catch (error) {
            console.log('[Upload] Error:', error);
            Alert.alert('失败', '上传过程中出现错误');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Surface style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text variant="headlineSmall" style={styles.headerTitle}>上传新图片</Text>

                {/* 图片预览区域 */}
                <Card style={styles.imageCard} mode="outlined">
                    {image ? (
                        <View>
                            <Card.Cover source={{ uri: image.uri }} style={styles.previewImage} />
                            <IconButton
                                icon="close-circle"
                                size={30}
                                iconColor={theme.colors.error}
                                style={styles.removeIcon}
                                onPress={() => setImage(null)}
                            />
                        </View>
                    ) : (
                        <TouchableOpacity onPress={onSelect} style={styles.placeholder}>
                            <IconButton icon="image-plus" size={40} />
                            <Text variant="bodyMedium">点击选择图片</Text>
                        </TouchableOpacity>
                    )}
                </Card>

                {/* 表单区域 */}
                <View style={styles.form}>
                    <TextInput
                        label="图片名称"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        placeholder="给你的图片起个名字"
                        style={styles.input}
                    />

                    <View style={styles.tagInputRow}>
                        <TextInput
                            label="添加标签"
                            value={tagInput}
                            onChangeText={setTagInput}
                            mode="outlined"
                            placeholder="如：风景"
                            style={[styles.input, { flex: 1 }]}
                            onSubmitEditing={addTag} // 回车添加
                        />
                        <Button
                            mode="contained-tonal"
                            onPress={addTag}
                            style={styles.addBtn}
                        >添加</Button>
                    </View>

                    {/* 已选标签展示 */}
                    <View style={styles.tagsWrapper}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                onClose={() => removeTag(index)}
                                style={styles.tagChip}
                                icon="tag"
                            >
                                {tag}
                            </Chip>
                        ))}
                    </View>

                    <Button
                        mode="contained"
                        onPress={onSubmit}
                        loading={uploading}
                        disabled={uploading || !image}
                        style={styles.submitBtn}
                        contentStyle={{ height: 50 }}
                    >
                        {uploading ? '上传中...' : '开始上传'}
                    </Button>
                </View>
            </ScrollView>
        </Surface>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    headerTitle: { marginBottom: 20, fontWeight: 'bold' },
    imageCard: {
        height: 220,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        overflow: 'hidden'
    },
    previewImage: { height: '100%' },
    placeholder: { alignItems: 'center', justifyContent: 'center', height: '100%' },
    removeIcon: { position: 'absolute', right: 0, top: 0 },
    form: { marginTop: 20 },
    input: { marginBottom: 15 },
    tagInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    addBtn: { marginLeft: 10, height: 50, justifyContent: 'center' },
    tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    tagChip: { marginRight: 8, marginBottom: 8 },
    submitBtn: { marginTop: 10, borderRadius: 12 }
});