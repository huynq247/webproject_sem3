/**
 * Color Configuration for Teacher Frontend
 * Centralized color management for easy customization
 */

export interface ColorConfig {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  glass: {
    background: string;
    border: string;
    hover: {
      background: string;
      border: string;
      shadow: string;
    };
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onGlass: string;
    shadow: string;
  };
  button: {
    primary: {
      background: string;
      color: string;
      shadow: string;
    };
    secondary: {
      background: string;
      color: string;
      border: string;
    };
    hover: {
      background: string;
      shadow: string;
    };
  };
  icons: {
    primary: string;
    secondary: string;
    accent: string;
  };
  tabs: {
    default: string;
    selected: string;
    indicator: string;
  };
  cards: {
    background: string;
    border: string;
    hover: {
      background: string;
      shadow: string;
    };
  };
  progress: {
    background: string;
    fill: string;
  };
}

// Current Golden Theme
export const goldenTheme: ColorConfig = {
  background: {
    primary: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
    secondary: '#ffffff',
    tertiary: '#f5f5f5'
  },
  glass: {
    background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.9) 0%, rgba(255, 239, 153, 0.8) 100%)',
    border: 'rgba(255, 215, 0, 0.3)',
    hover: {
      background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.95) 0%, rgba(255, 215, 0, 0.6) 100%)',
      border: 'rgba(255, 215, 0, 0.5)',
      shadow: 'rgba(255, 215, 0, 0.4)'
    }
  },
  text: {
    primary: '#1e3c72',
    secondary: '#1e3c72',
    tertiary: '#1e3c72',
    onGlass: '#1e3c72',
    shadow: 'rgba(30, 60, 114, 0.3)'
  },
  button: {
    primary: {
      background: 'linear-gradient(45deg, #D4AF37 30%, #FFD700 90%)',
      color: '#333333',
      shadow: 'rgba(212, 175, 55, .3)'
    },
    secondary: {
      background: 'transparent',
      color: '#1e3c72',
      border: '#1e3c72'
    },
    hover: {
      background: 'linear-gradient(45deg, #B8860B 30%, #D4AF37 90%)',
      shadow: 'rgba(212, 175, 55, .4)'
    }
  },
  icons: {
    primary: '#D4AF37',
    secondary: '#2196F3',
    accent: '#FF9800'
  },
  tabs: {
    default: '#1e3c72',
    selected: '#2a5298',
    indicator: '#2a5298'
  },
  cards: {
    background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.9) 0%, rgba(255, 239, 153, 0.8) 100%)',
    border: 'rgba(255, 215, 0, 0.3)',
    hover: {
      background: 'linear-gradient(135deg, rgba(255, 248, 220, 0.95) 0%, rgba(255, 215, 0, 0.6) 100%)',
      shadow: 'rgba(255, 215, 0, 0.4)'
    }
  },
  progress: {
    background: 'rgba(30, 60, 114, 0.2)',
    fill: '#2a5298'
  }
};

// Alternative Blue Theme (Original)
export const blueTheme: ColorConfig = {
  background: {
    primary: '#1e3c72',
    secondary: '#2a5298',
    tertiary: '#19547b'
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.2)',
    hover: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: 'rgba(255, 255, 255, 0.3)',
      shadow: 'rgba(255, 107, 107, 0.3)'
    }
  },
  text: {
    primary: 'white',
    secondary: 'rgba(255,255,255,0.8)',
    tertiary: 'rgba(255,255,255,0.6)',
    onGlass: 'white',
    shadow: 'rgba(0,0,0,0.3)'
  },
  button: {
    primary: {
      background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
      color: 'white',
      shadow: 'rgba(30, 60, 114, .3)'
    },
    secondary: {
      background: 'transparent',
      color: '#87CEEB',
      border: '#87CEEB'
    },
    hover: {
      background: 'linear-gradient(45deg, #2a5298 30%, #19547b 90%)',
      shadow: 'rgba(30, 60, 114, .3)'
    }
  },
  icons: {
    primary: '#87CEEB',
    secondary: '#64B5F6',
    accent: '#81C784'
  },
  tabs: {
    default: 'white',
    selected: '#87CEEB',
    indicator: '#87CEEB'
  },
  cards: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    hover: {
      background: 'rgba(255, 255, 255, 0.15)',
      shadow: 'rgba(0,0,0,0.3)'
    }
  },
  progress: {
    background: 'rgba(255,255,255,0.2)',
    fill: '#87CEEB'
  }
};

// Green Theme Example
export const greenTheme: ColorConfig = {
  background: {
    primary: 'linear-gradient(135deg, #f0fff0 0%, #e8f5e8 50%, #d0f0d0 100%)',
    secondary: '#f0fff0',
    tertiary: '#e8f5e8'
  },
  glass: {
    background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.9) 0%, rgba(152, 251, 152, 0.8) 100%)',
    border: 'rgba(34, 139, 34, 0.3)',
    hover: {
      background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.95) 0%, rgba(34, 139, 34, 0.6) 100%)',
      border: 'rgba(34, 139, 34, 0.5)',
      shadow: 'rgba(34, 139, 34, 0.4)'
    }
  },
  text: {
    primary: '#006400',
    secondary: '#228B22',
    tertiary: '#32CD32',
    onGlass: '#006400',
    shadow: 'rgba(0, 100, 0, 0.3)'
  },
  button: {
    primary: {
      background: 'linear-gradient(45deg, #228B22 30%, #32CD32 90%)',
      color: 'white',
      shadow: 'rgba(34, 139, 34, .3)'
    },
    secondary: {
      background: 'transparent',
      color: '#006400',
      border: '#006400'
    },
    hover: {
      background: 'linear-gradient(45deg, #006400 30%, #228B22 90%)',
      shadow: 'rgba(34, 139, 34, .4)'
    }
  },
  icons: {
    primary: '#32CD32',
    secondary: '#228B22',
    accent: '#FFD700'
  },
  tabs: {
    default: '#006400',
    selected: '#228B22',
    indicator: '#228B22'
  },
  cards: {
    background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.9) 0%, rgba(152, 251, 152, 0.8) 100%)',
    border: 'rgba(34, 139, 34, 0.3)',
    hover: {
      background: 'linear-gradient(135deg, rgba(144, 238, 144, 0.95) 0%, rgba(34, 139, 34, 0.6) 100%)',
      shadow: 'rgba(34, 139, 34, 0.4)'
    }
  },
  progress: {
    background: 'rgba(0, 100, 0, 0.2)',
    fill: '#228B22'
  }
};

// Active theme - Change this to switch themes
export const currentTheme: ColorConfig = blueTheme;

// Theme names for easy reference
export const themeNames = {
  golden: 'goldenTheme',
  blue: 'blueTheme',
  green: 'greenTheme'
} as const;

// Helper functions
export const getTheme = (themeName: keyof typeof themeNames): ColorConfig => {
  switch (themeName) {
    case 'golden':
      return goldenTheme;
    case 'blue':
      return blueTheme;
    case 'green':
      return greenTheme;
    default:
      return goldenTheme;
  }
};

export const applyTheme = (theme: ColorConfig) => {
  // You can add logic here to apply theme dynamically
  return theme;
};
