import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  TextField,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
} from '@mui/material';
import { 
  Palette, 
  Preview, 
  Style, 
  Assignment, 
  School, 
  CheckCircle 
} from '@mui/icons-material';
import { 
  goldenTheme, 
  blueTheme, 
  greenTheme, 
  currentTheme, 
  themeNames,
  ColorConfig 
} from '../theme/colors.config';
import { ThemeUtils } from '../theme/utils';
import { GlassBackground, GlassPaper, GlassButton } from './common/GlassTheme';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <input
        type="color"
        value={value.includes('linear-gradient') ? '#FFD700' : value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 40, height: 40, border: 'none', borderRadius: 4 }}
      />
      <TextField
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ flex: 1 }}
      />
    </Box>
  </Box>
);

const ThemeCustomizer: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themeNames>('golden');
  const [customTheme, setCustomTheme] = useState<ColorConfig>(currentTheme);
  const [tabValue, setTabValue] = useState(0);

  const handleThemeChange = (theme: keyof typeof themeNames) => {
    setSelectedTheme(theme);
    switch (theme) {
      case 'golden':
        setCustomTheme(goldenTheme);
        break;
      case 'blue':
        setCustomTheme(blueTheme);
        break;
      case 'green':
        setCustomTheme(greenTheme);
        break;
    }
    // Update the theme in ThemeUtils
    ThemeUtils.updateTheme(customTheme);
  };

  const updateCustomTheme = (path: string, value: string) => {
    setCustomTheme(prev => {
      const newTheme = { ...prev };
      const keys = path.split('.');
      let current: any = newTheme;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      // Apply the updated theme
      ThemeUtils.updateTheme(newTheme);
      return newTheme;
    });
  };

  const exportTheme = () => {
    const themeCode = `export const customTheme: ColorConfig = ${JSON.stringify(customTheme, null, 2)};`;
    navigator.clipboard.writeText(themeCode);
    alert('Theme code copied to clipboard!');
  };

  return (
    <GlassBackground>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            ...ThemeUtils.getText.withShadow(),
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2
          }}>
            <Palette /> Theme Customizer
          </Typography>
          <Typography variant="subtitle1" sx={ThemeUtils.getText.styles().secondary}>
            Customize your application colors and see live preview
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Theme Selector */}
          <Box sx={{ flex: { xs: '1', md: '0 0 300px' } }}>
            <GlassPaper>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, ...ThemeUtils.getText.styles().primary }}>
                  Select Theme
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={selectedTheme}
                    onChange={(e) => handleThemeChange(e.target.value as keyof typeof themeNames)}
                  >
                    <MenuItem value="golden">Golden Theme</MenuItem>
                    <MenuItem value="blue">Blue Theme</MenuItem>
                    <MenuItem value="green">Green Theme</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="h6" sx={{ mb: 2, ...ThemeUtils.getText.styles().primary }}>
                  Background Colors
                </Typography>
                <ColorInput
                  label="Primary Background"
                  value={customTheme.background.primary}
                  onChange={(value) => updateCustomTheme('background.primary', value)}
                />
                
                <Typography variant="h6" sx={{ mb: 2, ...ThemeUtils.getText.styles().primary }}>
                  Glass Colors
                </Typography>
                <ColorInput
                  label="Glass Background"
                  value={customTheme.glass.background}
                  onChange={(value) => updateCustomTheme('glass.background', value)}
                />
                <ColorInput
                  label="Glass Border"
                  value={customTheme.glass.border}
                  onChange={(value) => updateCustomTheme('glass.border', value)}
                />

                <Typography variant="h6" sx={{ mb: 2, ...ThemeUtils.getText.styles().primary }}>
                  Text Colors
                </Typography>
                <ColorInput
                  label="Primary Text"
                  value={customTheme.text.primary}
                  onChange={(value) => updateCustomTheme('text.primary', value)}
                />

                <Typography variant="h6" sx={{ mb: 2, ...ThemeUtils.getText.styles().primary }}>
                  Button Colors
                </Typography>
                <ColorInput
                  label="Button Background"
                  value={customTheme.button.primary.background}
                  onChange={(value) => updateCustomTheme('button.primary.background', value)}
                />
                <ColorInput
                  label="Button Text"
                  value={customTheme.button.primary.color}
                  onChange={(value) => updateCustomTheme('button.primary.color', value)}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={exportTheme}
                  sx={{ mt: 2, ...ThemeUtils.getButton.primary() }}
                >
                  Export Theme Code
                </Button>
              </Box>
            </GlassPaper>
          </Box>

          {/* Preview */}
          <Box sx={{ flex: 1 }}>
            <GlassPaper>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, ...ThemeUtils.getText.styles().primary }}>
                  <Preview sx={{ mr: 1 }} /> Live Preview
                </Typography>

                {/* Stats Cards Preview */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
                  <Card sx={ThemeUtils.getCard()}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Assignment sx={{ mr: 2, ...ThemeUtils.getIcon.withShadow() }} />
                        <Box>
                          <Typography variant="h5" sx={ThemeUtils.getText.withShadow()}>
                            42
                          </Typography>
                          <Typography variant="body2" sx={ThemeUtils.getText.styles().secondary}>
                            Total Items
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={ThemeUtils.getCard()}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School sx={{ mr: 2, ...ThemeUtils.getIcon.withShadow() }} />
                        <Box>
                          <Typography variant="h5" sx={ThemeUtils.getText.withShadow()}>
                            18
                          </Typography>
                          <Typography variant="body2" sx={ThemeUtils.getText.styles().secondary}>
                            In Progress
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={ThemeUtils.getCard()}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle sx={{ mr: 2, ...ThemeUtils.getIcon.withShadow() }} />
                        <Box>
                          <Typography variant="h5" sx={ThemeUtils.getText.withShadow()}>
                            24
                          </Typography>
                          <Typography variant="body2" sx={ThemeUtils.getText.styles().secondary}>
                            Completed
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                {/* Tabs Preview */}
                <Paper sx={{ ...ThemeUtils.getGlass.styles(), mb: 4 }}>
                  <Box sx={{ p: 2 }}>
                    <Tabs
                      value={tabValue}
                      onChange={(_, newValue) => setTabValue(newValue)}
                      sx={ThemeUtils.getTabs()}
                    >
                      <Tab label="All (42)" />
                      <Tab label="Active (18)" />
                      <Tab label="Completed (24)" />
                    </Tabs>
                  </Box>
                </Paper>

                {/* Buttons Preview */}
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Button variant="contained" sx={ThemeUtils.getButton.primary()}>
                    Primary Button
                  </Button>
                  <Button variant="outlined" sx={ThemeUtils.getButton.secondary()}>
                    Secondary Button
                  </Button>
                </Box>

                {/* Progress Preview */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" sx={{ mb: 1, ...ThemeUtils.getText.styles().primary }}>
                    Progress Example
                  </Typography>
                  <LinearProgress variant="determinate" value={65} sx={ThemeUtils.getProgress()} />
                </Box>

                {/* Cards Preview */}
                <Card sx={ThemeUtils.getCard()}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={ThemeUtils.getText.styles().primary}>
                        Sample Assignment
                      </Typography>
                      <Chip label="completed" color="success" size="small" />
                    </Box>
                    <Typography variant="body2" sx={ThemeUtils.getText.styles().secondary}>
                      This is a sample assignment description to show how text appears on the themed background.
                    </Typography>
                  </CardContent>
                </Card>

                {/* Theme Code Display */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, ...ThemeUtils.getText.styles().primary }}>
                    Current Theme Configuration
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)' }}>
                    <pre style={{ fontSize: '12px', overflow: 'auto', margin: 0 }}>
                      {JSON.stringify(customTheme, null, 2)}
                    </pre>
                  </Paper>
                </Box>
              </Box>
            </GlassPaper>
          </Box>
        </Box>
      </Container>
    </GlassBackground>
  );
};

export default ThemeCustomizer;
