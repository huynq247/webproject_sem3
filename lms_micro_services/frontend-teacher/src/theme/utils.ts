import { currentTheme, ColorConfig } from './colors.config';

/**
 * Theme Utility Functions
 * Helper functions to easily apply theme colors throughout the application
 */

export class ThemeUtils {
  private static theme: ColorConfig = currentTheme;

  // Background utilities
  static getBackground = {
    primary: () => this.theme.background.primary,
    secondary: () => this.theme.background.secondary,
    tertiary: () => this.theme.background.tertiary,
  };

  // Glass utilities
  static getGlass = {
    background: () => this.theme.glass.background,
    border: () => this.theme.glass.border,
    hover: () => ({
      background: this.theme.glass.hover.background,
      border: this.theme.glass.hover.border,
      shadow: `0 12px 40px ${this.theme.glass.hover.shadow}`,
    }),
    styles: () => ({
      background: this.theme.glass.background,
      backdropFilter: 'blur(20px)',
      border: `1px solid ${this.theme.glass.border}`,
      borderRadius: 3,
      '&:hover': {
        background: this.theme.glass.hover.background,
        boxShadow: `0 12px 40px ${this.theme.glass.hover.shadow}`,
        border: `1px solid ${this.theme.glass.hover.border}`,
      },
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
  };

  // Text utilities
  static getText = {
    primary: () => this.theme.text.primary,
    secondary: () => this.theme.text.secondary,
    tertiary: () => this.theme.text.tertiary,
    onGlass: () => this.theme.text.onGlass,
    withShadow: (opacity: number = 1) => ({
      color: this.theme.text.primary,
      textShadow: `0 1px 2px ${this.theme.text.shadow.replace('0.3', (0.3 * opacity).toString())}`,
    }),
    styles: () => ({
      primary: { color: this.theme.text.primary },
      secondary: { color: this.theme.text.secondary, opacity: 0.8 },
      tertiary: { color: this.theme.text.tertiary, opacity: 0.6 },
      onGlass: { color: this.theme.text.onGlass },
    }),
  };

  // Button utilities
  static getButton = {
    primary: () => ({
      background: this.theme.button.primary.background,
      color: this.theme.button.primary.color,
      fontWeight: 'bold',
      boxShadow: `0 3px 5px 2px ${this.theme.button.primary.shadow}`,
      borderRadius: 25,
      '&:hover': {
        background: this.theme.button.hover.background,
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 10px 4px ${this.theme.button.hover.shadow}`,
      },
      transition: 'all 0.3s ease',
    }),
    secondary: () => ({
      background: this.theme.button.secondary.background,
      color: this.theme.button.secondary.color,
      borderColor: this.theme.button.secondary.border,
      '&:hover': {
        backgroundColor: `${this.theme.button.secondary.color}10`,
        borderColor: this.theme.button.secondary.border,
      },
    }),
  };

  // Icon utilities
  static getIcon = {
    primary: () => this.theme.icons.primary,
    secondary: () => this.theme.icons.secondary,
    accent: () => this.theme.icons.accent,
    withShadow: (iconColor?: string) => ({
      color: iconColor || this.theme.icons.primary,
      filter: `drop-shadow(0 2px 4px ${this.theme.text.shadow})`,
    }),
  };

  // Tab utilities
  static getTabs = () => ({
    '& .MuiTab-root': {
      color: this.theme.tabs.default,
      fontWeight: 600,
      '&.Mui-selected': {
        color: this.theme.tabs.selected,
      },
    },
    '& .MuiTabs-indicator': {
      backgroundColor: this.theme.tabs.indicator,
    },
  });

  // Card utilities
  static getCard = () => ({
    background: this.theme.cards.background,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${this.theme.cards.border}`,
    color: this.theme.text.onGlass,
    '&:hover': {
      background: this.theme.cards.hover.background,
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${this.theme.cards.hover.shadow}`,
    },
    transition: 'all 0.3s ease',
  });

  // Progress utilities
  static getProgress = () => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: this.theme.progress.background,
    '& .MuiLinearProgress-bar': {
      backgroundColor: this.theme.progress.fill,
    },
  });

  // List item utilities
  static getListItem = (index: number) => ({
    py: 2,
    px: 3,
    borderRadius: 2,
    mb: 1,
    mx: 1,
    background: index % 2 === 0 
      ? this.theme.glass.background
      : this.theme.cards.background,
    border: `1px solid ${this.theme.glass.border}`,
    cursor: 'pointer',
    color: this.theme.text.onGlass,
    '&:hover': {
      background: this.theme.glass.hover.background,
      transform: 'translateX(8px)',
      boxShadow: `0 4px 15px ${this.theme.glass.hover.shadow}`,
    },
    transition: 'all 0.3s ease',
  });

  // Avatar utilities
  static getAvatar = (gradientColors?: string[]) => ({
    background: gradientColors 
      ? `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`
      : `linear-gradient(135deg, ${this.theme.icons.primary} 0%, ${this.theme.icons.secondary} 100%)`,
    width: 48,
    height: 48,
    boxShadow: `0 4px 12px ${this.theme.glass.hover.shadow}`,
    border: `2px solid ${this.theme.glass.border}`,
  });

  // Update theme dynamically
  static updateTheme = (newTheme: ColorConfig) => {
    this.theme = newTheme;
  };

  // Get current theme
  static getCurrentTheme = () => this.theme;
}

// Export for easy use
export const {
  getBackground,
  getGlass,
  getText,
  getButton,
  getIcon,
  getTabs,
  getCard,
  getProgress,
  getListItem,
  getAvatar,
} = ThemeUtils;
