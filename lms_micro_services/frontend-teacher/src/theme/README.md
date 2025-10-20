# Theme Configuration System

Hệ thống quản lý theme tập trung cho Frontend Teacher, cho phép bạn dễ dàng tùy chỉnh màu sắc cho toàn bộ ứng dụng.

## Cấu trúc Files

### 1. `src/theme/colors.config.ts`
File chính chứa tất cả cấu hình màu sắc:
- `ColorConfig` interface: Định nghĩa cấu trúc theme
- `goldenTheme`: Theme vàng hiện tại
- `blueTheme`: Theme xanh navy gốc  
- `greenTheme`: Theme xanh lá (ví dụ)
- `currentTheme`: Theme đang được sử dụng

### 2. `src/theme/utils.ts`
File utilities cung cấp helper functions:
- `ThemeUtils`: Class chính với các methods tiện ích
- Helper functions cho background, glass, text, buttons, icons, etc.

### 3. `src/components/ThemeCustomizer.tsx`
Component demo cho phép:
- Preview live theme changes
- Chọn theme có sẵn
- Tùy chỉnh màu sắc
- Export theme code

### 4. `src/components/common/GlassTheme.tsx` (Đã cập nhật)
Components glass đã được cập nhật để sử dụng theme system.

## Cách Sử Dụng

### 1. Thay đổi theme có sẵn
```typescript
// Trong colors.config.ts, thay đổi dòng này:
export const currentTheme: ColorConfig = blueTheme; // Thay vì goldenTheme
```

### 2. Tạo theme mới
```typescript
export const myCustomTheme: ColorConfig = {
  background: {
    primary: 'linear-gradient(135deg, #your-color 0%, #your-color2 100%)',
    secondary: '#your-secondary-color',
    tertiary: '#your-tertiary-color'
  },
  glass: {
    background: 'linear-gradient(135deg, rgba(r, g, b, 0.9) 0%, rgba(r, g, b, 0.8) 100%)',
    border: 'rgba(r, g, b, 0.3)',
    hover: {
      background: 'rgba(r, g, b, 0.95)',
      border: 'rgba(r, g, b, 0.5)',
      shadow: 'rgba(r, g, b, 0.4)'
    }
  },
  text: {
    primary: '#your-text-color',
    secondary: '#your-secondary-text',
    tertiary: '#your-tertiary-text',
    onGlass: '#your-glass-text',
    shadow: 'rgba(r, g, b, 0.3)'
  },
  // ... rest of config
};
```

### 3. Sử dụng trong components
```typescript
import { ThemeUtils } from '../theme/utils';

// Background
<Box sx={{ background: ThemeUtils.getBackground.primary() }}>

// Glass component
<Paper sx={ThemeUtils.getGlass.styles()}>

// Text with theme
<Typography sx={ThemeUtils.getText.withShadow()}>

// Button with theme
<Button sx={ThemeUtils.getButton.primary()}>

// Icons with theme
<Icon sx={ThemeUtils.getIcon.withShadow()} />

// Cards with theme
<Card sx={ThemeUtils.getCard()}>

// Tabs with theme
<Tabs sx={ThemeUtils.getTabs()}>
```

### 4. Sử dụng ThemeCustomizer
```typescript
// Thêm route trong App.tsx
import ThemeCustomizer from './components/ThemeCustomizer';

// Route: /theme-customizer
<Route path="/theme-customizer" element={<ThemeCustomizer />} />
```

## Các Theme Có Sẵn

### Golden Theme (Hiện tại)
- Nền: Gradient trắng
- Glass: Vàng nhạt với opacity
- Text: Xanh navy (#1e3c72)
- Buttons: Gradient vàng
- Phù hợp: Giao diện sang trọng, chuyên nghiệp

### Blue Theme (Gốc)
- Nền: Xanh navy
- Glass: Trắng với opacity
- Text: Trắng
- Buttons: Gradient xanh
- Phù hợp: Giao diện hiện đại, công nghệ

### Green Theme (Ví dụ)
- Nền: Gradient xanh lá nhạt
- Glass: Xanh lá với opacity  
- Text: Xanh đậm
- Buttons: Gradient xanh lá
- Phù hợp: Giao diện thân thiện, tự nhiên

## Quick Start

1. **Thay đổi theme nhanh:**
   ```typescript
   // colors.config.ts
   export const currentTheme: ColorConfig = blueTheme; // hoặc greenTheme
   ```

2. **Chỉnh sửa màu cụ thể:**
   ```typescript
   // colors.config.ts
   export const currentTheme: ColorConfig = {
     ...goldenTheme,
     text: {
       ...goldenTheme.text,
       primary: '#your-new-color'
     }
   };
   ```

3. **Test theme mới:**
   - Chạy ứng dụng
   - Vào `/theme-customizer`
   - Chọn theme hoặc chỉnh sửa màu
   - Copy code và paste vào `colors.config.ts`

## Tips

- Luôn test theme trên nhiều components khác nhau
- Đảm bảo contrast ratio tốt cho accessibility
- Sử dụng ThemeCustomizer để preview trước khi apply
- Backup theme cũ trước khi thay đổi
- Màu text shadow nên có opacity thấp (0.3-0.5)
- Glass background nên có opacity 0.8-0.95

## Troubleshooting

**Lỗi: Colors không update**
- Restart development server
- Clear browser cache
- Kiểm tra import đúng từ `currentTheme`

**Lỗi: Text khó đọc**
- Tăng contrast ratio
- Thêm text shadow
- Điều chỉnh opacity của background

**Lỗi: Import không tìm thấy**
- Kiểm tra đường dẫn import
- Đảm bảo files được tạo đúng vị trí
