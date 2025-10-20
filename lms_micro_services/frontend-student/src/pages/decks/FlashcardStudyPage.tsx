import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { 
  ArrowBack,
  FlipToFront,
  Quiz,
  CheckCircle,
  Cancel,
  Shuffle,
  RestartAlt,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService, Flashcard } from '../../services/content.service';

interface StudySession {
  currentCardIndex: number;
  totalCards: number;
  correctAnswers: number;
  incorrectAnswers: number;
  isFlipped: boolean;
  shuffledCards: Flashcard[];
  completedCards: Set<string>;
}

const FlashcardStudyPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<StudySession>({
    currentCardIndex: 0,
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    isFlipped: false,
    shuffledCards: [],
    completedCards: new Set(),
  });
  
  const [showResults, setShowResults] = useState(false);
  const [studyStarted, setStudyStarted] = useState(false);

  // Fetch deck details
  const { data: deck, isLoading } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => contentService.getDeck(deckId!),
    enabled: !!deckId,
  });

  const initializeStudy = useCallback(() => {
    if (!deck?.flashcards || deck.flashcards.length === 0) return;
    
    const shuffled = [...deck.flashcards].sort(() => Math.random() - 0.5);
    setSession({
      currentCardIndex: 0,
      totalCards: shuffled.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      isFlipped: false,
      shuffledCards: shuffled,
      completedCards: new Set(),
    });
    setStudyStarted(true);
    setShowResults(false);
  }, [deck]);

  const flipCard = () => {
    setSession(prev => ({
      ...prev,
      isFlipped: !prev.isFlipped
    }));
  };

  const markAnswer = (isCorrect: boolean) => {
    const currentCard = session.shuffledCards[session.currentCardIndex];
    if (!currentCard) return;

    const newCompletedCards = new Set(session.completedCards);
    newCompletedCards.add(currentCard.id);

    const newSession = {
      ...session,
      correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: session.incorrectAnswers + (isCorrect ? 0 : 1),
      completedCards: newCompletedCards,
      isFlipped: false,
    };

    if (session.currentCardIndex < session.totalCards - 1) {
      newSession.currentCardIndex = session.currentCardIndex + 1;
    } else {
      // Study session completed
      setShowResults(true);
    }

    setSession(newSession);
  };

  const restartStudy = () => {
    initializeStudy();
  };

  const goToDeckDetail = () => {
    navigate(`/decks/${deckId}`);
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

  const getScorePercentage = () => {
    const total = session.correctAnswers + session.incorrectAnswers;
    return total > 0 ? Math.round((session.correctAnswers / total) * 100) : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading Study Session...
        </Typography>
      </Container>
    );
  }

  if (!deck) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Deck Not Found
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/decks')}>
          Back to Decks
        </Button>
      </Container>
    );
  }

  if (!deck.flashcards || deck.flashcards.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          No Flashcards Available
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This deck doesn't have any flashcards to study yet.
        </Typography>
        <Button startIcon={<ArrowBack />} onClick={goToDeckDetail}>
          Back to Deck
        </Button>
      </Container>
    );
  }

  if (!studyStarted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" component="h1" gutterBottom>
            📚 {deck.title}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {deck.description}
          </Typography>
          
          <Card sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
            <CardContent>
              <Box display="flex" justifyContent="center" mb={2}>
                <Quiz sx={{ fontSize: 64, color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Ready to Study?
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {deck.flashcards.length} flashcards waiting for you
              </Typography>
              <Box display="flex" gap={1} justifyContent="center" mb={2}>
                <Chip
                  label={deck.difficulty || 'No difficulty'}
                  color={getDifficultyColor(deck.difficulty)}
                  size="small"
                />
                <Chip
                  label={`${deck.flashcards.length} cards`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>

          <Box display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={goToDeckDetail}
            >
              Back to Deck
            </Button>
            <Button
              variant="contained"
              startIcon={<Shuffle />}
              onClick={initializeStudy}
              size="large"
            >
              Start Study Session
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  const currentCard = session.shuffledCards[session.currentCardIndex];
  const progress = ((session.currentCardIndex + 1) / session.totalCards) * 100;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          📚 {deck.title}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={goToDeckDetail}
          size="small"
        >
          Exit Study
        </Button>
      </Box>

      {/* Progress Bar */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Card {session.currentCardIndex + 1} of {session.totalCards}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}% Complete
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
      </Box>

      {/* Study Card */}
      <Card 
        sx={{ 
          height: 400,
          mb: 3,
          cursor: 'pointer',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
        onClick={flipCard}
      >
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Chip
              label={currentCard.difficulty}
              color={getDifficultyColor(currentCard.difficulty)}
              size="small"
            />
            <IconButton onClick={(e) => { e.stopPropagation(); flipCard(); }}>
              {session.isFlipped ? <Quiz /> : <FlipToFront />}
            </IconButton>
          </Box>

          <Box 
            sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              p: 2,
            }}
          >
            {!session.isFlipped ? (
              <>
                <FlipToFront sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom color="primary">
                  Question
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {currentCard.front}
                </Typography>
              </>
            ) : (
              <>
                <Quiz sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom color="secondary">
                  Answer
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {currentCard.back}
                </Typography>
              </>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            {session.isFlipped ? 'Click to see question' : 'Click to reveal answer'}
          </Typography>
        </CardContent>
      </Card>

      {/* Answer Buttons */}
      {session.isFlipped && (
        <Box display="flex" gap={2} justifyContent="center">
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => markAnswer(false)}
            size="large"
          >
            Incorrect
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => markAnswer(true)}
            size="large"
          >
            Correct
          </Button>
        </Box>
      )}

      {/* Score Display */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          Score
        </Typography>
        <Typography variant="h6" color={`${getScoreColor()}.main`}>
          {session.correctAnswers}/{session.correctAnswers + session.incorrectAnswers}
        </Typography>
      </Box>

      {/* Results Dialog */}
      <Dialog open={showResults} maxWidth="sm" fullWidth>
        <DialogTitle textAlign="center">
          🎉 Study Session Complete!
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" color={`${getScoreColor()}.main`} gutterBottom>
              {getScorePercentage()}%
            </Typography>
            <Typography variant="h6" gutterBottom>
              {session.correctAnswers} out of {session.totalCards} correct
            </Typography>
            
            {getScorePercentage() >= 90 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Excellent work! You've mastered this deck! 🌟
              </Alert>
            )}
            {getScorePercentage() >= 70 && getScorePercentage() < 90 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Good job! A few more reviews and you'll have it down! 👍
              </Alert>
            )}
            {getScorePercentage() < 70 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Keep practicing! You're making progress! 💪
              </Alert>
            )}
          </Box>
          
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              textAlign: 'center'
            }}
          >
            <Box>
              <Typography variant="h4" color="success.main">
                {session.correctAnswers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" color="error.main">
                {session.incorrectAnswers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incorrect
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={goToDeckDetail}>
            Back to Deck
          </Button>
          <Button
            variant="contained"
            startIcon={<RestartAlt />}
            onClick={restartStudy}
          >
            Study Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FlashcardStudyPage;
