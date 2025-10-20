# Admin Frontend Themes

## 🎨 Available Themes

### 1. Bright Theme (Current) ✅
**File**: `src/theme/brightTheme.ts`

**Đặc điểm**:
- ✅ Background trắng sáng (#f8fafc)
- ✅ Chữ đen rõ ràng (#0f172a)
- ✅ Contrast cao, dễ đọc
- ✅ Professional và clean
- ✅ Blue (#2563eb) primary color
- ✅ Purple (#7c3aed) secondary color

**Phù hợp**: 
- Làm việc lâu dài không mỏi mắt
- Môi trường văn phòng sáng
- In ấn documents
- Accessibility tốt

### 2. Modern Theme (Backup)
**File**: `src/theme/modernTheme.ts`

**Đặc điểm**:
- Glass morphism effect
- Gradient backgrounds
- Soft colors
- Modern aesthetic

**Phù hợp**:
- Creative work
- Presentations
- Marketing materials

## 🔄 Switch Themes

Edit `src/App.tsx`:

### Use Bright Theme (Default):
```typescript
import brightTheme from './theme/brightTheme';
const adminTheme = brightTheme;
```

### Use Modern Theme:
```typescript
import modernTheme from './theme/modernTheme';
const adminTheme = modernTheme;
```

## 🎨 Color Palette

### Bright Theme Colors

#### Primary (Blue)
- Main: `#2563eb` - Professional blue
- Light: `#3b82f6`
- Dark: `#1d4ed8`
- Usage: Primary buttons, links, active states

#### Secondary (Purple)
- Main: `#7c3aed`
- Light: `#8b5cf6`
- Dark: `#6d28d9`
- Usage: Accent elements, secondary actions

#### Background
- Default: `#f8fafc` - Light gray background
- Paper: `#ffffff` - Pure white cards

#### Text
- Primary: `#0f172a` - Almost black (high contrast)
- Secondary: `#475569` - Dark gray

#### Status Colors
- Success: `#10b981` - Green
- Warning: `#f59e0b` - Orange
- Error: `#ef4444` - Red
- Info: `#3b82f6` - Blue

## 📝 Typography

### Font Family
```css
"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extra Bold: 800

### Headings
- H1: 2.5rem, 800 weight
- H2: 2rem, 700 weight
- H3: 1.75rem, 700 weight
- H4: 1.5rem, 600 weight
- H5: 1.25rem, 600 weight
- H6: 1.125rem, 600 weight

### Body
- Body1: 1rem, 400 weight
- Body2: 0.875rem, 400 weight

## 🎯 Component Styles

### Buttons
- Border radius: 10px
- Font weight: 600
- No text transform
- Hover: lift effect (-1px)

### Cards
- Border radius: 16px
- White background
- Subtle border (#e2e8f0)
- Hover: lift + shadow

### Text Fields
- Border radius: 10px
- 2px border
- White background
- Focus: blue border

### Chips
- Border radius: 8px
- Colored backgrounds with borders
- Medium font weight

## 🔧 Customization

### Add Custom Colors

Edit `brightTheme.ts`:

```typescript
palette: {
  // Add new color
  custom: {
    main: '#your-color',
    light: '#lighter-shade',
    dark: '#darker-shade',
    contrastText: '#text-color',
  },
}
```

### Override Component Styles

```typescript
components: {
  MuiButton: {
    styleOverrides: {
      root: {
        // Your custom styles
      },
    },
  },
}
```

## 📱 Responsive Design

Theme is fully responsive with:
- Mobile breakpoints
- Adaptive spacing
- Flexible typography
- Touch-friendly hit areas

## ♿ Accessibility

Bright theme follows WCAG 2.1 Level AA:
- ✅ Contrast ratio > 4.5:1 for normal text
- ✅ Contrast ratio > 3:1 for large text
- ✅ Focus indicators visible
- ✅ Color is not the only indicator

## 🧪 Testing Colors

### Check Contrast
Use online tools:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)

### Test with Users
- Ask for feedback on readability
- Test in different lighting conditions
- Verify on different screens

## 📚 Resources

- [Material-UI Theme Documentation](https://mui.com/material-ui/customization/theming/)
- [Color Theory for Designers](https://www.interaction-design.org/literature/topics/color-theory)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2025-10-14
**Current Theme**: Bright Theme
**Status**: ✅ Production Ready
