import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Quiz, Psychology, Timeline } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../../services/content.service';
import { GlassContainer, GradientText } from '../../components/common/GlassContainer';

const FlashcardsListPage: React.FC = () => {
  // Fetch all decks first
  const { data: decksData, isLoading: decksLoading, error: decksError } = useQuery({
    queryKey: ['decks'],
    queryFn: contentService.getDecks,
  });

  // Get all flashcards from all decks
  const deckIds = decksData?.decks?.map((deck: any) => deck.id) || [];
  
  const flashcardQueries = useQuery({
    queryKey: ['all-flashcards', deckIds],
    queryFn: async () => {
      if (deckIds.length === 0) return [];
      
      const allFlashcards: any[] = [];
      
      for (const deckId of deckIds) {
        try {
          const response = await contentService.getFlashcards(deckId);
          const flashcards = response.flashcards || [];
          
          // Add deck title to each flashcard
          const deck = decksData?.decks?.find((d: any) => d.id === deckId);
          const flashcardsWithDeck = flashcards.map((card: any) => ({
            ...card,
            deck_title: deck?.title || 'Unknown Deck'
          }));
          
          allFlashcards.push(...flashcardsWithDeck);
        } catch (error) {
          console.error(`Error fetching flashcards for deck ${deckId}:`, error);
        }
      }
      
      return allFlashcards;
    },
    enabled: deckIds.length > 0,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  if (decksLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (decksError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading decks: {decksError instanceof Error ? decksError.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  const flashcards = flashcardQueries.data || [];
  const totalDecks = decksData?.decks?.length || 0;
  const totalFlashcards = flashcards.length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <GlassContainer sx={{ mb: 4 }}>
        <GradientText variant="primary" component={Typography} sx={{ variant: 'h4', component: 'h1', gutterBottom: true }}>
          <Quiz sx={{ mr: 2, verticalAlign: 'middle' }} />
          Flashcards Management
        </GradientText>
        
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Overview of all flashcards in the system
        </Typography>
      </GlassContainer>

      {/* Summary Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 3, 
        mb: 4 
      }}>
        <GlassContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                Total Decks
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {totalDecks}
              </Typography>
            </Box>
            <Psychology sx={{ fontSize: 40, color: '#1976d2', opacity: 0.8 }} />
          </Box>
        </GlassContainer>

        <GlassContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                Total Flashcards
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02' }}>
                {totalFlashcards}
              </Typography>
            </Box>
            <Quiz sx={{ fontSize: 40, color: '#ed6c02', opacity: 0.8 }} />
          </Box>
        </GlassContainer>

        <GlassContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 500 }}>
                Average per Deck
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                {totalDecks > 0 ? Math.round(totalFlashcards / totalDecks) : 0}
              </Typography>
            </Box>
            <Timeline sx={{ fontSize: 40, color: '#2e7d32', opacity: 0.8 }} />
          </Box>
        </GlassContainer>
      </Box>

      {/* Loading state for flashcards */}
      {flashcardQueries.isLoading && (
        <GlassContainer sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading flashcards...</Typography>
        </GlassContainer>
      )}

      {/* Error state for flashcards */}
      {flashcardQueries.error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Error loading flashcards: {flashcardQueries.error instanceof Error ? flashcardQueries.error.message : 'Unknown error'}
        </Alert>
      )}

      {/* Flashcards List */}
      {!flashcardQueries.isLoading && flashcards.length === 0 && (
        <GlassContainer sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No flashcards found in the system
          </Typography>
        </GlassContainer>
      )}

      {flashcards.length > 0 && (
        <GlassContainer>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            All Flashcards ({flashcards.length})
          </Typography>
          
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
          }}>
            {flashcards.map((flashcard, index) => (
              <Card key={flashcard.id || index} sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      From: {flashcard.deck_title}
                    </Typography>
                    <Chip 
                      label={flashcard.difficulty || 'medium'} 
                      color={getDifficultyColor(flashcard.difficulty)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Q: {flashcard.front}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    A: {flashcard.back}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Order: {flashcard.order}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      ID: {flashcard.id?.substring(0, 8)}...
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </GlassContainer>
      )}
    </Container>
  );
};

export default FlashcardsListPage;
