import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Divider,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AutoAwesome, Psychology, Create, School, ArrowBack } from '@mui/icons-material';
import { AIService, FlashcardGenerationRequest, FlashcardGenerationResponse } from '../../services/ai.service';

const AIDeckCreator: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<FlashcardGenerationResponse | null>(null);

  const [formData, setFormData] = useState<FlashcardGenerationRequest>({
    topic: '',
    quantity: 10,
    language: 'vietnamese',
    deck_name: '',
    deck_description: '',
  });

  const handleInputChange = (field: keyof FlashcardGenerationRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'number' ? parseInt(event.target.value) : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof FlashcardGenerationRequest) => (
    event: SelectChangeEvent
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim() || !formData.deck_name.trim()) {
      setError('Please enter both topic and deck name');
      return;
    }

    if (formData.quantity < 5 || formData.quantity > 50) {
      setError('Quantity must be between 5 and 50');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await AIService.generateFlashcards(formData);
      setResult(response);
      setSuccess(`Successfully created deck "${response.deck.title}" with ${response.flashcards_count} flashcards!`);
      
      // Navigate to deck detail after 2 seconds
      setTimeout(() => {
        navigate(`/decks/${response.deck.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate deck');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      topic: '',
      quantity: 10,
      language: 'vietnamese',
      deck_name: '',
      deck_description: '',
    });
    setResult(null);
    setError(null);
    setSuccess(null);
  };

  const generateSuggestion = () => {
    const suggestions = [
      { topic: 'Lịch sử Việt Nam thời kỳ phong kiến', deck: 'Lịch sử Việt Nam cơ bản' },
      { topic: 'Toán học cấp 2 - Đại số', deck: 'Toán đại số lớp 8' },
      { topic: 'Sinh học tế bào', deck: 'Sinh học cơ bản' },
      { topic: 'Văn học Việt Nam hiện đại', deck: 'Văn học thế kỷ 20' },
      { topic: 'Hóa học vô cơ', deck: 'Hóa học THPT' },
      { topic: 'Địa lý tự nhiên Việt Nam', deck: 'Địa lý Việt Nam' },
    ];
    
    const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setFormData(prev => ({
      ...prev,
      topic: suggestion.topic,
      deck_name: suggestion.deck
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/decks')}
          sx={{ mb: 2 }}
        >
          Back to Decks
        </Button>
      </Box>

      <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AutoAwesome sx={{ mr: 2, color: 'primary.main' }} />
        AI Deck Creator
      </Typography>

      <Grid container spacing={3}>
        {/* Form Panel */}
        <Grid {...({item: true, xs: 12, md: 6} as any)}>
          <Card>
            <CardHeader 
              title="Create Deck with AI"
              avatar={<Psychology color="primary" />}
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Topic"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.topic}
                  onChange={handleInputChange('topic')}
                  placeholder="e.g., Lịch sử Việt Nam thời kỳ phong kiến, English Grammar - Present Perfect, Toán học cấp 2"
                  helperText="Describe the topic you want to create flashcards about"
                />

                <TextField
                  label="Deck Name"
                  variant="outlined"
                  fullWidth
                  value={formData.deck_name}
                  onChange={handleInputChange('deck_name')}
                  placeholder="e.g., Lịch sử Việt Nam cơ bản"
                  helperText="Name for your flashcard deck"
                />

                <TextField
                  label="Deck Description (Optional)"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.deck_description}
                  onChange={handleInputChange('deck_description')}
                  placeholder="Brief description of the deck content"
                  helperText="AI will generate one if left empty"
                />

                <Grid container spacing={2}>
                  <Grid {...({item: true, xs: 6} as any)}>
                    <TextField
                      label="Number of Flashcards"
                      type="number"
                      variant="outlined"
                      fullWidth
                      value={formData.quantity}
                      onChange={handleInputChange('quantity')}
                      inputProps={{ min: 5, max: 50 }}
                      helperText="5-50 flashcards"
                    />
                  </Grid>
                  <Grid {...({item: true, xs: 6} as any)}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={formData.language}
                        label="Language"
                        onChange={handleSelectChange('language')}
                      >
                        <MenuItem value="vietnamese">Vietnamese</MenuItem>
                        <MenuItem value="english">English</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  variant="outlined"
                  onClick={generateSuggestion}
                  startIcon={<School />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Get Suggestion
                </Button>

                {error && (
                  <Alert severity="error">{error}</Alert>
                )}

                {success && (
                  <Alert severity="success">{success}</Alert>
                )}

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Create />}
                    sx={{ flex: 1 }}
                  >
                    {loading ? 'Generating Deck...' : 'Generate Deck'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Result Panel */}
        <Grid {...({item: true, xs: 12, md: 6} as any)}>
          {result && (
            <Card>
              <CardHeader title="Generated Deck" />
              <CardContent>
                <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6" component="div">
                    {result.deck.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    {result.deck.description}
                  </Typography>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={`${result.flashcards_count} Flashcards`} 
                    color="success" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`Deck ID: ${result.deck_id.slice(-8)}`} 
                    color="primary" 
                    size="small" 
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                  What's Next?
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Review Flashcards"
                      secondary="Check the generated content and edit if needed"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Assign to Students"
                      secondary="Share this deck with your students"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Track Progress"
                      secondary="Monitor how students perform with this deck"
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate(`/decks/${result.deck.id}`)}
                    fullWidth
                  >
                    View Deck Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          {!result && (
            <Card>
              <CardHeader title="💡 Tips for Better Results" />
              <CardContent>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Be Specific"
                      secondary="More detailed topics generate better flashcards"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Optimal Quantity"
                      secondary="10-20 flashcards work best for most topics"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Clear Naming"
                      secondary="Use descriptive deck names for better organization"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Language Consistency"
                      secondary="Choose the language that matches your topic"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIDeckCreator;
