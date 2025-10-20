import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  SelectChangeEvent,
} from '@mui/material';
import { SmartToy, Psychology, Create, ArrowBack } from '@mui/icons-material';
import { AIService, SingleFlashcardRequest, SingleFlashcardResponse } from '../../services/ai.service';
import { contentService, CreateFlashcardRequest, Deck } from '../../services/content.service';

const AIFlashcardCreator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deckId = searchParams.get('deckId');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [flashcard, setFlashcard] = useState<SingleFlashcardResponse | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch decks for selection
  const { data: decksData } = useQuery({
    queryKey: ['decks'],
    queryFn: contentService.getDecks,
  });

  const decks = decksData?.decks || [];

  // Helper function to safely extract error message
  const getErrorMessage = (error: any): string => {
    console.log('🔍 Full error object:', error);
    
    if (typeof error === 'string') return error;
    
    // Handle validation errors (array of error objects)
    if (Array.isArray(error)) {
      return error.map(err => typeof err === 'string' ? err : err.msg || 'Validation error').join(', ');
    }
    
    // Handle API error responses
    if (error?.response?.data) {
      const data = error.response.data;
      console.log('🔍 Error response data:', data);
      
      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.message === 'string') return data.message;
      if (Array.isArray(data.detail)) {
        const detailMessages = data.detail.map((err: any) => {
          if (typeof err === 'string') return err;
          if (err.msg) return `${err.loc?.join('.')||'field'}: ${err.msg}`;
          return err.message || 'Validation error';
        });
        return detailMessages.join(', ');
      }
      
      // If it's an object, stringify it for debugging
      if (typeof data.detail === 'object') {
        return `Validation error: ${JSON.stringify(data.detail)}`;
      }
    }
    
    if (error?.message && typeof error.message === 'string') return error.message;
    
    return 'An unexpected error occurred';
  };

  // Set selectedDeckId when deckId is provided via URL
  useEffect(() => {
    if (deckId) {
      setSelectedDeckId(deckId);
    }
  }, [deckId]);

  const [formData, setFormData] = useState<SingleFlashcardRequest>({
    word_or_topic: '',
    language: 'english',
    card_type: 'vocabulary',
    difficulty: 'medium',
    include_pronunciation: true,
    include_examples: true,
    include_synonyms: true,
  });

  const handleInputChange = (field: keyof SingleFlashcardRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof SingleFlashcardRequest) => (
    event: SelectChangeEvent
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word_or_topic.trim()) {
      setError('Please enter a word or topic');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setFlashcard(null);

    try {
      console.log('🔍 Generating flashcard with data:', formData);
      const result = await AIService.generateSingleFlashcard(formData);
      console.log('✅ AI Service response:', result);
      
      // Validate the response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from AI service');
      }
      
      setFlashcard(result);
      
      // Only auto-save if deckId came from URL (user clicked from deck menu)
      if (deckId && selectedDeckId) {
        console.log('🔄 Auto-saving flashcard to pre-selected deck');
        await saveFlashcardToDeck(result);
      } else {
        setSuccess('Flashcard generated successfully! You can now select a deck to save it.');
        console.log('📋 Flashcard generated, waiting for user to select deck');
      }
    } catch (err: any) {
      console.error('❌ Error generating flashcard:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const saveFlashcardToDeck = async (flashcardData: SingleFlashcardResponse) => {
    const targetDeckId = selectedDeckId || deckId;
    console.log('🔍 saveFlashcardToDeck called with:', {
      selectedDeckId,
      deckId,
      targetDeckId,
      flashcardData: flashcardData ? 'present' : 'missing'
    });
    
    if (!targetDeckId) {
      console.error('❌ No target deck ID provided');
      setError('Please select a deck first');
      return;
    }

    if (!flashcardData) {
      console.error('❌ No flashcard data provided');
      setError('No flashcard data to save');
      return;
    }

    setSaveLoading(true);
    setError(null);

    try {
      // Extract the actual word from question like "What does 'word' mean?"
      const extractWordFromQuestion = (question: string): string => {
        // Try to extract word from patterns like "What does 'word' mean?" or "What does word mean?"
        const match1 = question.match(/what does ['"]([^'"]+)['"] mean\?/i);
        const match2 = question.match(/what does ([a-zA-Z]+) mean\?/i);
        const match3 = question.match(/['"]([^'"]+)['"]/); // fallback: any quoted text
        
        if (match1) return match1[1];
        if (match2) return match2[1];
        if (match3) return match3[1];
        
        // If no pattern matches, use the question as is
        return question;
      };

      // Extract wordclass from tags (look for common word classes)
      const extractWordClass = (tags: string[]): string => {
        console.log('🔍 Searching for wordclass in tags:', tags);
        const wordClasses = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection'];
        const foundClass = tags.find(tag => {
          const match = wordClasses.some(wc => tag.toLowerCase().includes(wc));
          console.log(`  - Tag "${tag}" contains wordclass? ${match}`);
          return match;
        });
        console.log('🎯 Found wordclass:', foundClass);
        return foundClass || '';
      };

      // Prepare base data
      const createFlashcardData: CreateFlashcardRequest = {
        deck_id: targetDeckId,
        front: extractWordFromQuestion(flashcardData.question || '').substring(0, 1000), // Extract word only
        back: (flashcardData.answer || '').substring(0, 2000), // Limit to 2000 chars
        order: 1, // Backend requires order >= 1
      };

      // Only add optional fields if they have content
      const definition = (flashcardData.explanation || '').substring(0, 2000);
      if (definition.trim()) {
        createFlashcardData.definition = definition;
      }

      const example = (flashcardData.examples && flashcardData.examples.length > 0 
        ? flashcardData.examples.join('; ') 
        : '').substring(0, 1000);
      if (example.trim()) {
        createFlashcardData.example = example;
      }

      // Add wordclass if available
      let wordclass = extractWordClass(flashcardData.tags || []);
      console.log('🏷️ Tags from AI:', flashcardData.tags);
      console.log('🔤 Extracted wordclass:', wordclass);
      
      // Fallback: try to detect wordclass from the answer/definition
      if (!wordclass.trim() && flashcardData.answer) {
        const answer = flashcardData.answer.toLowerCase();
        const definition = (flashcardData.explanation || '').toLowerCase();
        const combinedText = `${answer} ${definition}`;
        
        console.log('🔍 Analyzing text for wordclass:', combinedText.substring(0, 100));
        
        // Check for verb indicators
        if (combinedText.includes('to ') && (
            combinedText.includes('action') || 
            combinedText.includes('process') || 
            combinedText.includes('activity') ||
            combinedText.includes('act of') ||
            combinedText.includes('to do') ||
            combinedText.includes('to make') ||
            combinedText.includes('to be') ||
            combinedText.includes('to have') ||
            combinedText.includes('to go') ||
            combinedText.includes('to travel') ||
            combinedText.includes('to investigate') ||
            combinedText.includes('to search') ||
            answer.startsWith('to ')
        )) {
          wordclass = 'verb';
          console.log('🎯 Fallback detected: verb from content analysis');
        }
        // Check for adjective indicators
        else if (combinedText.includes('adjective') || 
                 combinedText.includes('describing') || 
                 combinedText.includes('quality') ||
                 combinedText.includes('characteristic') ||
                 combinedText.includes('having the quality')) {
          wordclass = 'adjective';
          console.log('🎯 Fallback detected: adjective from content analysis');
        }
        // Check for noun indicators (default fallback)
        else if (combinedText.includes('noun') || 
                 combinedText.includes('person') || 
                 combinedText.includes('place') || 
                 combinedText.includes('thing') ||
                 combinedText.includes('object') ||
                 combinedText.includes('concept')) {
          wordclass = 'noun';
          console.log('🎯 Fallback detected: noun from content analysis');
        }
      }
      
      // Smart detection based on the word itself and its definition
      if (!wordclass.trim()) {
        const word = createFlashcardData.front.toLowerCase();
        const definition = (flashcardData.answer || '').toLowerCase();
        
        // Common verb patterns
        if (definition.startsWith('to ') || 
            definition.includes('the act of') ||
            definition.includes('the process of') ||
            ['explore', 'create', 'develop', 'analyze', 'investigate', 'travel', 'study', 'learn'].includes(word)) {
          wordclass = 'verb';
          console.log('🎯 Smart detection: verb based on word/definition pattern');
        }
        // Common adjective patterns  
        else if (definition.includes('having') || 
                 definition.includes('characterized by') ||
                 ['beautiful', 'important', 'difficult', 'easy', 'large', 'small'].includes(word)) {
          wordclass = 'adjective';
          console.log('🎯 Smart detection: adjective based on word/definition pattern');
        }
        // Default to noun
        else {
          wordclass = 'noun';
          console.log('🎯 Default: setting as noun');
        }
      }
      
      if (wordclass.trim()) {
        createFlashcardData.wordclass = wordclass.substring(0, 50);
        console.log('✅ Added wordclass to data:', createFlashcardData.wordclass);
      } else {
        console.log('❌ No wordclass detected from tags or fallback');
      }

      console.log('📦 Creating flashcard with data:', createFlashcardData);
      console.log('🎯 Target deck ID:', targetDeckId);
      console.log('📊 Data validation:');
      console.log('  - original question:', flashcardData.question);
      console.log('  - extracted front:', createFlashcardData.front);
      console.log('  - front length:', createFlashcardData.front.length);
      console.log('  - back length:', createFlashcardData.back.length);
      console.log('  - order:', createFlashcardData.order);
      console.log('  - has definition:', !!createFlashcardData.definition);
      console.log('  - has example:', !!createFlashcardData.example);
      console.log('  - has wordclass:', !!createFlashcardData.wordclass);
      
      await contentService.createFlashcard(createFlashcardData);
      setSuccess('Flashcard added to deck successfully!');
      
      // Navigate back to deck detail after 2 seconds
      setTimeout(() => {
        navigate(`/decks/${targetDeckId}`);
      }, 2000);
    } catch (err: any) {
      console.error('❌ Error saving flashcard to deck:', err);
      setError(getErrorMessage(err));
    } finally {
      setSaveLoading(false);
    }
  };

  const handleManualSave = async () => {
    console.log('🔄 Manual save triggered');
    
    if (saveLoading) {
      console.log('⚠️ Save already in progress, ignoring');
      return;
    }
    
    if (!flashcard) {
      console.error('❌ No flashcard to save');
      setError('No flashcard to save');
      return;
    }
    
    if (!selectedDeckId) {
      console.error('❌ No deck selected');
      setError('Please select a deck first');
      return;
    }
    
    console.log('✅ Proceeding with save');
    await saveFlashcardToDeck(flashcard);
  };

  const handleReset = () => {
    setFormData({
      word_or_topic: '',
      language: 'english',
      card_type: 'vocabulary',
      difficulty: 'medium',
      include_pronunciation: true,
      include_examples: true,
      include_synonyms: true,
    });
    setFlashcard(null);
    setError(null);
    setSuccess(null);
    if (!deckId) { // Only reset selectedDeckId if not coming from URL
      setSelectedDeckId('');
    }
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
        <SmartToy sx={{ mr: 2, color: 'primary.main' }} />
        {deckId ? 'Add AI Flashcard to Deck' : 'AI Flashcard Creator'}
      </Typography>

      {deckId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Creating flashcard for existing deck. The generated flashcard will be automatically added to the selected deck.
        </Alert>
      )}

      {!deckId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Create AI-powered flashcards and optionally save them to your existing decks.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Panel */}
        <Grid {...({item: true, xs: 12, md: 6} as any)}>
          <Card>
            <CardHeader 
              title="Create Flashcard with AI"
              avatar={<Psychology color="primary" />}
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Word or Topic"
                  variant="outlined"
                  fullWidth
                  value={formData.word_or_topic}
                  onChange={handleInputChange('word_or_topic')}
                  placeholder="e.g., abundant, procrastinate, present perfect"
                  helperText="Enter an English word, Vietnamese word, or grammar topic"
                />

                <Grid container spacing={2}>
                  <Grid {...({item: true, xs: 6} as any)}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={formData.language}
                        label="Language"
                        onChange={handleSelectChange('language')}
                      >
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="vietnamese">Vietnamese</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid {...({item: true, xs: 6} as any)}>
                    <FormControl fullWidth>
                      <InputLabel>Card Type</InputLabel>
                      <Select
                        value={formData.card_type}
                        label="Card Type"
                        onChange={handleSelectChange('card_type')}
                      >
                        <MenuItem value="vocabulary">Vocabulary</MenuItem>
                        <MenuItem value="grammar">Grammar</MenuItem>
                        <MenuItem value="pronunciation">Pronunciation</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <FormControl fullWidth>
                  <InputLabel>Select Deck (Optional)</InputLabel>
                  <Select
                    value={selectedDeckId}
                    label="Select Deck (Optional)"
                    onChange={(e) => setSelectedDeckId(e.target.value)}
                    disabled={!!deckId} // Disable if deckId is from URL
                  >
                    <MenuItem value="">
                      <em>No deck selected - Generate flashcard only</em>
                    </MenuItem>
                    {decks.map((deck: Deck) => (
                      <MenuItem key={deck.id} value={deck.id}>
                        {deck.title} ({deck.total_flashcards || 0} cards)
                      </MenuItem>
                    ))}
                  </Select>
                  {deckId ? (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Deck pre-selected from navigation
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {decks.length} deck(s) available. Select one to automatically save the flashcard.
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={formData.difficulty}
                    label="Difficulty"
                    onChange={handleSelectChange('difficulty')}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Include Additional Information:
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.include_pronunciation}
                        onChange={handleInputChange('include_pronunciation')}
                      />
                    }
                    label="Pronunciation (IPA)"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.include_examples}
                        onChange={handleInputChange('include_examples')}
                      />
                    }
                    label="Example Sentences"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.include_synonyms}
                        onChange={handleInputChange('include_synonyms')}
                      />
                    }
                    label="Synonyms"
                  />
                </Box>

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
                    {loading ? 'Generating...' : 'Generate Flashcard'}
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
          {flashcard && typeof flashcard === 'object' && flashcard.question && flashcard.answer && (
            <Card>
              <CardHeader title="Generated Flashcard" />
              <CardContent>
                <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6" component="div">
                    Q: {String(flashcard.question || '')}
                  </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Typography variant="h6" component="div">
                    A: {String(flashcard.answer || '')}
                  </Typography>
                </Paper>

                {flashcard.pronunciation && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Pronunciation:
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                      {String(flashcard.pronunciation)}
                    </Typography>
                  </Box>
                )}

                {flashcard.examples && flashcard.examples.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Examples:
                    </Typography>
                    {flashcard.examples.map((example, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5, fontStyle: 'italic' }}>
                        • {String(example)}
                      </Typography>
                    ))}
                  </Box>
                )}

                {flashcard.synonyms && flashcard.synonyms.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Synonyms:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {flashcard.synonyms.map((synonym, index) => (
                        <Chip key={index} label={String(synonym)} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                {flashcard.explanation && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Explanation:
                    </Typography>
                    <Typography variant="body2">
                      {String(flashcard.explanation)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {flashcard.tags && flashcard.tags.map((tag, index) => (
                      <Chip key={index} label={String(tag)} size="small" color="primary" />
                    ))}
                  </Box>
                  <Chip label={String(flashcard.difficulty)} color="secondary" />
                </Box>

                {/* Save to Deck section */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        Debug: deckId={deckId}, selectedDeckId={selectedDeckId}, saveLoading={saveLoading.toString()}
                      </Typography>
                    </Box>
                  )}
                  
                  {!selectedDeckId ? (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Save to Deck:
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Choose a deck</InputLabel>
                        <Select
                          value={selectedDeckId}
                          label="Choose a deck"
                          onChange={(e) => setSelectedDeckId(e.target.value)}
                        >
                          {decks.map((deck: Deck) => (
                            <MenuItem key={deck.id} value={deck.id}>
                              {deck.title} ({deck.total_flashcards || 0} cards)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Selected deck: {decks.find((d: Deck) => d.id === selectedDeckId)?.title || 'Unknown'}
                      </Typography>
                    </Box>
                  )}
                  
                  <Button
                    variant="contained"
                    onClick={handleManualSave}
                    fullWidth
                    size="large"
                    disabled={saveLoading || !selectedDeckId}
                    startIcon={saveLoading ? <CircularProgress size={20} /> : null}
                  >
                    {saveLoading ? 'Saving...' : selectedDeckId ? 'Save to Deck' : 'Select a deck first'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {flashcard && (!flashcard.question || !flashcard.answer) && (
            <Card>
              <CardHeader title="Error" />
              <CardContent>
                <Alert severity="error">
                  Received invalid flashcard data. Please try again.
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Debug info: {JSON.stringify(flashcard, null, 2)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIFlashcardCreator;
