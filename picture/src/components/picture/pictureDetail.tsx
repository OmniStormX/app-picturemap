import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
// @ts-ignore
import { ReactNativeZoomableView } from '@dudigital/react-native-zoomable-view';
import FastImage from 'react-native-fast-image';
import { getImageUrl } from '../../services/getPictureUrl.ts';

const { width, height } = Dimensions.get('window');

interface PictureDetailProps {
  visible: boolean;
  name: string;
  onClose: () => void;
}

export function PictureDetail({ visible, name, onClose }: PictureDetailProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        {/* 返回按钮 - 放在最顶层 */}
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>

        {/* 核心缩放容器：
          - maxZoom: 最大放大倍数
          - minZoom: 最小缩小倍数
          - bindToBorders: 如果图片放大后，限制其不能拖出空白（这就是 iOS 相册的感觉）
        */}
        <ReactNativeZoomableView
          maxZoom={5}
          minZoom={1}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders={true} // 关键：开启后大图不会漂移到屏幕外
          captureEvent={true}
          style={styles.zoomWrapper}
        >
          <FastImage
            source={{ uri: getImageUrl(name) }}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
          />
        </ReactNativeZoomableView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomWrapper: {
    width: width,
    height: height,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    zIndex: 999,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
  },
});