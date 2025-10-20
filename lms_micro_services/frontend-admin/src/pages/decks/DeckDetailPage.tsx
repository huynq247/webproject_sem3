import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  School, 
  ArrowBack,
  FlipToFront,
  Quiz
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService, Flashcard, CreateFlashcardRequest } from '../../services/content.service';
import { RoleBasedComponent } from '../../components/common/RoleBasedComponent';

const DeckDetailPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [error, setError] = useState<string>('');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateFlashcardRequest>();

  // Fetch deck details
  const { data: deck, isLoading } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => contentService.getDeck(deckId!),
    enabled: !!deckId,
  });

  // Fetch flashcards for this deck
  const { data: flashcardsData, isLoading: isLoadingFlashcards, error: flashcardsError } = useQuery<{flashcards: Flashcard[]}>({
    queryKey: ['flashcards', deckId],
    queryFn: () => contentService.getFlashcards(deckId!),
    enabled: !!deckId,
  });

  // Create flashcard mutation
  const createFlashcardMutation = useMutation({
    mutationFn: contentService.createFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] });
      setOpenCreateDialog(false);
      setEditingCard(null);
      reset();
      setError('');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to save flashcard');
    },
  });

  // Delete flashcard mutation
  const deleteFlashcardMutation = useMutation({
    mutationFn: (cardId: string) => contentService.deleteFlashcard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deck', deckId] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] });
    },
  });

  const handleCreateFlashcard = (data: CreateFlashcardRequest) => {
    const flashcardData = {
      ...data,
      deck_id: deckId!,
      order: data.order || (flashcardsData?.flashcards?.length || 0) + 1, // Auto set order if not provided
    };
    createFlashcardMutation.mutate(flashcardData);
  };

  const handleEditFlashcard = (card: Flashcard) => {
    setEditingCard(card);
    setValue('front', card.front);
    setValue('back', card.back);
    setValue('difficulty', card.difficulty);
    setValue('deck_id', card.deck_id);
    setValue('order', card.order);
    setValue('front_image_url', card.front_image_url || '');
    setValue('back_image_url', card.back_image_url || '');
    setValue('wordclass', card.wordclass || '');
    setValue('definition', card.definition || '');
    setValue('example', card.example || '');
    setOpenCreateDialog(true);
  };

  const handleDeleteFlashcard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcardMutation.mutate(cardId);
    }
  };

  const handleFlipCard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  const handleStartStudy = () => {
    navigate(`/decks/${deckId}/study`);
  };

  const getDifficultyColor = (difficulty: string | undefined | null) => {
    if (!difficulty) return 'default';
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const closeDialog = () => {
    setOpenCreateDialog(false);
    setEditingCard(null);
    reset();
    setError('');
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading Deck...
        </Typography>
      </Container>
    );
  }

  if (!deck) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Deck Not Found
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/decks')}>
          Back to Decks
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/decks')}
            sx={{ mb: 2 }}
          >
            Back to Decks
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            📚 {deck.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {deck.description}
          </Typography>
          <Box display="flex" gap={1} mb={2}>
            <Chip
              label={deck.difficulty || 'No difficulty'}
              color={getDifficultyColor(deck.difficulty)}
              size="small"
            />
            <Chip
              label={`${deck.total_flashcards || 0} cards`}
              variant="outlined"
              size="small"
            />
            {deck.is_public && (
              <Chip
                label="Public"
                color="info"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<School />}
            onClick={handleStartStudy}
            disabled={!deck.flashcards || deck.flashcards.length === 0}
          >
            Study Deck
          </Button>
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Add Card
            </Button>
          </RoleBasedComponent>
        </Box>
      </Box>

      {/* Deck Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4
        }}
      >
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="primary">
            {deck.total_flashcards || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Cards
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="success.main">
            {/* Cannot calculate by difficulty without flashcards data */}
            0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Easy Cards
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="warning.main">
            {/* Cannot calculate by difficulty without flashcards data */}
            0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Medium Cards
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h4" color="error.main">
            {/* Cannot calculate by difficulty without flashcards data */}
            0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hard Cards
          </Typography>
        </Paper>
      </Box>

      {/* Flashcards Grid */}
      <Typography variant="h5" component="h2" gutterBottom>
        Flashcards ({flashcardsData?.flashcards?.length || 0})
      </Typography>
      
      {/* Flashcards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4
        }}
      >
        {/* Simple test render */}
        {flashcardsData && flashcardsData.flashcards && flashcardsData.flashcards.length > 0 ? (
          flashcardsData.flashcards.map((flashcard) => (
            <Card 
              key={flashcard.id}
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <CardContent 
                onClick={() => handleFlipCard(flashcard.id)}
                sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                  {flippedCards.has(flashcard.id) ? flashcard.back : flashcard.front}
                </Typography>
                
                {/* Show additional vocabulary info when available */}
                {(flashcard.definition || flashcard.example || flashcard.wordclass) && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    {flashcard.wordclass && (
                      <Chip 
                        label={flashcard.wordclass} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                    {flashcard.definition && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Definition:</strong> {flashcard.definition.length > 100 
                          ? `${flashcard.definition.substring(0, 100)}...` 
                          : flashcard.definition}
                      </Typography>
                    )}
                    {flashcard.example && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        <strong>Example:</strong> {flashcard.example.length > 100 
                          ? `${flashcard.example.substring(0, 100)}...` 
                          : flashcard.example}
                      </Typography>
                    )}
                  </Box>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={flashcard.difficulty || 'medium'} 
                    size="small" 
                    color={getDifficultyColor(flashcard.difficulty)}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {flippedCards.has(flashcard.id) ? 'Back' : 'Front'}
                  </Typography>
                </Box>
              </CardContent>
              <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFlashcard(flashcard);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFlashcard(flashcard.id);
                    }}
                    color="error"
                  >
                    Delete
                  </Button>
                </CardActions>
              </RoleBasedComponent>
            </Card>
          ))
        ) : null}
      </Box>

      {/* Empty State */}
      {(!isLoadingFlashcards && (!flashcardsData?.flashcards || flashcardsData.flashcards.length === 0)) && (
        <Box textAlign="center" mt={6}>
          <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Flashcards Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add flashcards to this deck to start studying!
          </Typography>
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Add Your First Flashcard
            </Button>
          </RoleBasedComponent>
        </Box>
      )}

      {/* Create/Edit Flashcard Dialog */}
      <Dialog open={openCreateDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(handleCreateFlashcard)}>
          <DialogTitle>
            {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              label="Front Content"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...register('front', { required: 'Front content is required' })}
              error={!!errors.front}
              helperText={errors.front?.message}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Back Content"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...register('back', { required: 'Back content is required' })}
              error={!!errors.back}
              helperText={errors.back?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Word Class (Optional)"
              fullWidth
              variant="outlined"
              placeholder="e.g., noun, verb, adjective"
              {...register('wordclass')}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Definition (Optional)"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Formal definition of the term"
              {...register('definition')}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Example (Optional)"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Example sentence or usage"
              {...register('example')}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Front Image URL (Optional)"
              fullWidth
              variant="outlined"
              placeholder="https://example.com/image.jpg"
              {...register('front_image_url')}
              sx={{ mb: 2 }}
            />

            <TextField
              margin="dense"
              label="Back Image URL (Optional)"
              fullWidth
              variant="outlined"
              placeholder="https://example.com/image.jpg"
              {...register('back_image_url')}
              sx={{ mb: 2 }}
            />

            {/* Vocabulary Information Section */}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Vocabulary Information (Optional)
            </Typography>
            
            <TextField
              margin="dense"
              label="Word Class"
              fullWidth
              variant="outlined"
              placeholder="noun, verb, adjective, etc."
              {...register('wordclass')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Definition"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Detailed definition of the word/concept"
              {...register('definition')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Example"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              placeholder="Usage example or sentence"
              {...register('example')}
              sx={{ mb: 2 }}
            />
            
            <TextField
              select
              margin="dense"
              label="Difficulty"
              fullWidth
              variant="outlined"
              {...register('difficulty', { required: 'Difficulty is required' })}
              error={!!errors.difficulty}
              helperText={errors.difficulty?.message}
              SelectProps={{
                native: true,
              }}
              sx={{ mb: 2 }}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </TextField>
            
            <TextField
              margin="dense"
              label="Order"
              type="number"
              fullWidth
              variant="outlined"
              {...register('order', { 
                required: 'Order is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Order must be at least 1' }
              })}
              error={!!errors.order}
              helperText={errors.order?.message}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createFlashcardMutation.isPending}>
              {createFlashcardMutation.isPending ? 'Saving...' : (editingCard ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default DeckDetailPage;
