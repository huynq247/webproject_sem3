import React, { useState } from 'react';
import {
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
  Fade,
  Grow,
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
import { GlassBackground } from '../../components/common/GlassTheme';

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
      <GlassBackground>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#1F2937', fontWeight: 600 }}>Loading Deck...</Typography>
        </Box>
      </GlassBackground>
    );
  }

  if (!deck) {
    return (
      <GlassBackground>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#1F2937', fontWeight: 600 }}>Deck Not Found</Typography>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/decks')}
            variant="outlined"
            sx={{ 
              color: '#7b8ec8',
              borderColor: 'rgba(168, 184, 240, 0.5)',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#7b8ec8',
                bgcolor: 'rgba(168, 184, 240, 0.1)'
              }
            }}
          >
            Back to Decks
          </Button>
        </Box>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/decks')}
            variant="outlined"
            sx={{ 
              mb: 2,
              color: '#7c3aed',
              borderColor: '#c4b5fd',
              borderWidth: 2,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#7c3aed',
                bgcolor: '#f5f3ff',
                borderWidth: 2
              }
            }}
          >
            Back to Decks
          </Button>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            color: '#5b21b6', // Deep purple
            fontWeight: 700,
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            📚 {deck.title}
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: '#475569', fontWeight: 500 }}>
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
            sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
              color: '#ffffff',
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.5)',
              },
              '&:disabled': {
                background: '#e5e7eb',
                color: '#9ca3af'
              }
            }}
          >
            Study Deck
          </Button>
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                borderColor: '#7c3aed',
                color: '#7c3aed',
                borderWidth: 2,
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  borderColor: '#6d28d9',
                  bgcolor: '#f5f3ff',
                  borderWidth: 2
                }
              }}
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
        <Paper sx={{ 
          p: 2.5, 
          textAlign: 'center', 
          bgcolor: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
          background: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 100%)',
          border: '2px solid #c4b5fd',
          borderRadius: 2
        }} elevation={0}>
          <Typography variant="h3" sx={{ 
            color: '#7c3aed',
            fontWeight: 700,
            mb: 1
          }}>
            {deck.total_flashcards || 0}
          </Typography>
          <Typography variant="body2" color="#6b21a8" fontWeight={600}>
            Total Cards
          </Typography>
        </Paper>
        <Paper sx={{ 
          p: 2.5, 
          textAlign: 'center', 
          bgcolor: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
          background: 'linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%)',
          border: '2px solid #86efac',
          borderRadius: 2
        }} elevation={0}>
          <Typography variant="h3" sx={{ 
            color: '#16a34a',
            fontWeight: 700,
            mb: 1
          }}>
            0
          </Typography>
          <Typography variant="body2" color="#15803d" fontWeight={600}>
            Easy Cards
          </Typography>
        </Paper>
        <Paper sx={{ 
          p: 2.5, 
          textAlign: 'center', 
          bgcolor: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fcd34d',
          borderRadius: 2
        }} elevation={0}>
          <Typography variant="h3" sx={{ 
            color: '#d97706',
            fontWeight: 700,
            mb: 1
          }}>
            0
          </Typography>
          <Typography variant="body2" color="#b45309" fontWeight={600}>
            Medium Cards
          </Typography>
        </Paper>
        <Paper sx={{ 
          p: 2.5, 
          textAlign: 'center', 
          bgcolor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          border: '2px solid #fca5a5',
          borderRadius: 2
        }} elevation={0}>
          <Typography variant="h3" sx={{ 
            color: '#dc2626',
            fontWeight: 700,
            mb: 1
          }}>
            0
          </Typography>
          <Typography variant="body2" color="#b91c1c" fontWeight={600}>
            Hard Cards
          </Typography>
        </Paper>
      </Box>

      {/* Flashcards Grid */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ 
        color: '#5b21b6',
        fontWeight: 700,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FlipToFront sx={{ color: '#7c3aed' }} />
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
                transition: 'all 0.3s ease',
                bgcolor: '#ffffff',
                border: '2px solid',
                borderColor: flippedCards.has(flashcard.id) ? '#7c3aed' : '#e0e7ff',
                borderRadius: 2,
                '&:hover': { 
                  transform: 'translateY(-4px) scale(1.02)',
                  borderColor: '#7c3aed',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.25)'
                }
              }}
              elevation={0}
            >
              <CardContent 
                onClick={() => handleFlipCard(flashcard.id)}
                sx={{ 
                  minHeight: 150, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  background: flippedCards.has(flashcard.id) 
                    ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
                }}
              >
                <Typography variant="body1" align="center" sx={{ 
                  color: '#1e293b', 
                  fontWeight: 600, 
                  mb: 2,
                  fontSize: '1.1rem'
                }}>
                  {flippedCards.has(flashcard.id) ? flashcard.back : flashcard.front}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip 
                    label={flashcard.difficulty || 'medium'} 
                    size="small" 
                    color={getDifficultyColor(flashcard.difficulty)}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={flippedCards.has(flashcard.id) ? '🔄 Back' : '📝 Front'}
                    size="small"
                    sx={{
                      bgcolor: flippedCards.has(flashcard.id) ? '#ede9fe' : '#e0e7ff',
                      color: '#5b21b6',
                      fontWeight: 600
                    }}
                  />
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
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          border: '2px dashed #c4b5fd',
          borderRadius: 3
        }} elevation={0}>
          <Quiz sx={{ fontSize: 72, color: '#7c3aed', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ color: '#5b21b6', fontWeight: 700, mb: 1 }}>
            No Flashcards Yet
          </Typography>
          <Typography variant="body1" color="#6b21a8" paragraph fontWeight={500} sx={{ mb: 3 }}>
            Add flashcards to this deck to start studying!
          </Typography>
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(124, 58, 237, 0.5)',
                }
              }}
            >
              Add Your First Flashcard
            </Button>
          </RoleBasedComponent>
        </Paper>
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
      </Box>
    </GlassBackground>
  );
};

export default DeckDetailPage;
