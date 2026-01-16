import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // --- 核心品牌色 (天青色系) ---
    primary: '#00838F',             // 主天青色
    onPrimary: '#FFFFFF',
    primaryContainer: '#B2EBF2',    // 浅天青背景
    onPrimaryContainer: '#002021',  // 极深青色文字

    // --- 次要与强调色 (辅助天青/蓝绿) ---
    secondary: '#4D6163',           // 带青色调的灰蓝色
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CFE7E9',  // 次要容器背景
    onSecondaryContainer: '#081E20',

    // --- 背景与表面色 (呼吸感来源) ---
    // MD3 的关键：让背景不再是死白的，而是带一点点青的冷白
    surface: '#F4FBFB',             // 非常浅的天青底色
    onSurface: '#191C1C',           // 表面文字色
    surfaceVariant: '#DAE4E5',      // 列表项、输入框的背景底色
    onSurfaceVariant: '#3F4849',    // 表面变体文字色
    
    // --- 其他关键颜色 ---
    outline: '#6F797A',             // 描边色
    outlineVariant: '#BEC8C9',      // 弱化描边
    elevation: {
      level0: 'transparent',
      level1: '#F0F7F8',            // 卡片提升高度后的背景色
      level2: '#EBF4F5',
      level3: '#E5F1F2',
      level4: '#E3F0F1',
      level5: '#DFEDEE',
    },
    
    // 阴影与遮罩
    scrim: '#000000',
    inverseSurface: '#2D3131',
    inverseOnSurface: '#EFF1F1',
    inversePrimary: '#4DD8E7',
  },
};