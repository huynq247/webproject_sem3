import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Paper,
  IconButton,
  Fade,
  Slide,
  Grow,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Refresh,
  CheckCircle,
  Cancel,
  Visibility,
  Quiz,
  EmojiEvents,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import contentService from '../../services/content.service';
import { useAuth } from '../../context/AuthContext';
import { GlassBackground } from '../../components/common/GlassTheme';

interface StudySession {
  deckId: string;
  deckTitle: string;
  totalCards: number;
  currentCardIndex: number;
  correctAnswers: number;
  incorrectAnswers: number;
  showAnswer: boolean;
  studiedCards: Set<string>;
  startTime: Date;
  endTime?: Date;
}

const StudyFlashcardsPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Study session state
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [studyMode, setStudyMode] = useState<'sequential' | 'random'>('sequential');
  const [isCardChanging, setIsCardChanging] = useState(false);

  // Fetch deck details and flashcards
  const { data: deckData, isLoading: deckLoading } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => contentService.getDeck(deckId!),
    enabled: !!deckId,
  });

  const { data: flashcardsData, isLoading: flashcardsLoading } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => contentService.getFlashcards(deckId!),
    enabled: !!deckId,
  });

  const flashcards = flashcardsData?.flashcards || [];

  // Save study progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: contentService.saveStudyProgress,
    onSuccess: (data) => {
      console.log('Study progress saved:', data);
    },
    onError: (error) => {
      console.error('Failed to save study progress:', error);
    },
  });

  // Initialize study session
  useEffect(() => {
    if (deckData && flashcards.length > 0 && !session) {
      const newSession: StudySession = {
        deckId: deckId!,
        deckTitle: deckData.title,
        totalCards: flashcards.length,
        currentCardIndex: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        showAnswer: false,
        studiedCards: new Set(),
        startTime: new Date(),
      };
      setSession(newSession);
      setCurrentCard(flashcards[0]);
    }
  }, [deckData, flashcards, deckId, session]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!session || showCompletionDialog) return;

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          handleFlipCard();
          break;
        case '1':
          event.preventDefault();
          if (session.showAnswer) {
            handleAnswerFeedback(false);
          }
          break;
        case '2':
          event.preventDefault();
          if (session.showAnswer) {
            handleAnswerFeedback(true);
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousCard();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNextCard();
          break;
        case 'r':
          event.preventDefault();
          handleRestart();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [session, showCompletionDialog]);

  const getProgress = () => {
    if (!session) return 0;
    return (session.studiedCards.size / session.totalCards) * 100;
  };

  const getScorePercentage = () => {
    if (!session || session.studiedCards.size === 0) return 0;
    return (session.correctAnswers / session.studiedCards.size) * 100;
  };

  const getNextCard = () => {
    if (!session || !flashcards) return null;
    
    if (studyMode === 'random') {
      const unstudiedCards = flashcards.filter(card => !session.studiedCards.has(card.id));
      if (unstudiedCards.length === 0) return null;
      return unstudiedCards[Math.floor(Math.random() * unstudiedCards.length)];
    } else {
      const nextIndex = session.currentCardIndex + 1;
      return nextIndex < flashcards.length ? flashcards[nextIndex] : null;
    }
  };

  const handleShowAnswer = () => {
    if (!session || session.showAnswer) return;
    setSession({ ...session, showAnswer: true });
  };

  const handleHideAnswer = () => {
    if (!session || !session.showAnswer) return;
    setSession({ ...session, showAnswer: false });
  };

  const handleFlipCard = () => {
    if (!session) return;
    setSession({ ...session, showAnswer: !session.showAnswer });
  };

  const handleAnswerFeedback = (correct: boolean) => {
    if (!session || !currentCard) return;

    const updatedStudiedCards = new Set(session.studiedCards);
    updatedStudiedCards.add(currentCard.id);

    const updatedSession = {
      ...session,
      correctAnswers: correct ? session.correctAnswers + 1 : session.correctAnswers,
      incorrectAnswers: correct ? session.incorrectAnswers : session.incorrectAnswers + 1,
      studiedCards: updatedStudiedCards,
      showAnswer: false, // Reset to front of card
    };

    setSession(updatedSession);

    // Check if study session is complete
    if (updatedStudiedCards.size >= session.totalCards) {
      updatedSession.endTime = new Date();
      setSession(updatedSession);
      
      // Save study progress
      const studyTime = Math.floor((updatedSession.endTime.getTime() - updatedSession.startTime.getTime()) / 60000);
      saveProgressMutation.mutate({
        deck_id: session.deckId,
        cards_studied: updatedStudiedCards.size,
        correct_answers: updatedSession.correctAnswers,
        incorrect_answers: updatedSession.incorrectAnswers,
        study_time_minutes: studyTime,
        completed: true,
      });
      
      setShowCompletionDialog(true);
      return;
    }

    // Move to next card after a short delay to show the flip animation
    setTimeout(() => {
      const nextCard = getNextCard();
      if (nextCard) {
        setIsCardChanging(true);
        
        setTimeout(() => {
          const nextIndex = studyMode === 'sequential' 
            ? session.currentCardIndex + 1 
            : flashcards.findIndex(card => card.id === nextCard.id);
          
          setSession(prev => prev ? { ...prev, currentCardIndex: nextIndex } : prev);
          setCurrentCard(nextCard);
          setIsCardChanging(false);
        }, 150);
      }
    }, 300);
  };

  const handleRestart = () => {
    if (!deckData || !flashcards.length) return;
    
    const newSession: StudySession = {
      deckId: deckId!,
      deckTitle: deckData.title,
      totalCards: flashcards.length,
      currentCardIndex: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      showAnswer: false,
      studiedCards: new Set(),
      startTime: new Date(),
    };
    setSession(newSession);
    setCurrentCard(flashcards[0]);
    setShowCompletionDialog(false);
  };

  const handlePreviousCard = () => {
    if (!session || session.currentCardIndex <= 0) return;
    
    const prevIndex = session.currentCardIndex - 1;
    setSession({
      ...session,
      currentCardIndex: prevIndex,
      showAnswer: false, // Reset to front of card
    });
    setCurrentCard(flashcards[prevIndex]);
  };

  const handleNextCard = () => {
    if (!session) return;
    
    const nextCard = getNextCard();
    if (nextCard) {
      const nextIndex = studyMode === 'sequential' 
        ? session.currentCardIndex + 1 
        : flashcards.findIndex(card => card.id === nextCard.id);
      
      setSession({
        ...session,
        currentCardIndex: nextIndex,
        showAnswer: false, // Reset to front of card
      });
      setCurrentCard(nextCard);
    }
  };

  const formatStudyTime = () => {
    if (!session?.endTime) return '';
    const duration = session.endTime.getTime() - session.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getPerformanceMessage = () => {
    const score = getScorePercentage();
    if (score >= 90) return { message: "Excellent! 🎉", color: "success" };
    if (score >= 75) return { message: "Great job! 👏", color: "primary" };
    if (score >= 60) return { message: "Good work! 👍", color: "warning" };
    return { message: "Keep practicing! 💪", color: "secondary" };
  };

  if (deckLoading || flashcardsLoading) {
    return (
      <GlassBackground>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography variant="h6" color="white">Loading flashcards...</Typography>
        </Box>
      </GlassBackground>
    );
  }

  if (!deckData || !flashcards.length) {
    return (
      <GlassBackground>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="white" gutterBottom>
            No flashcards found
          </Typography>
          <Button variant="contained" onClick={() => navigate('/decks')}>
            Back to Decks
          </Button>
        </Box>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" color="#7b8ec8" gutterBottom sx={{ fontWeight: 700 }}>
            📚 {session?.deckTitle}
          </Typography>
          <Typography variant="subtitle1" color="#6B7280">
            Study Session
          </Typography>
        </Box>

        {/* Progress Bar */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 2, 
            mb: 3,
            background: '#ffffff',
            border: '1px solid rgba(168, 184, 240, 0.2)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="#1F2937" fontWeight={600}>
              Progress: {session?.studiedCards.size || 0} / {session?.totalCards || 0}
            </Typography>
            <Typography variant="body2" color="#1F2937" fontWeight={600}>
              {Math.round(getProgress())}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgress()} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'rgba(168, 184, 240, 0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#4caf50'
              }
            }} 
          />
        </Paper>

        {/* Study Mode Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              label="Sequential"
              color={studyMode === 'sequential' ? 'primary' : 'default'}
              onClick={() => setStudyMode('sequential')}
              variant={studyMode === 'sequential' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Random"
              color={studyMode === 'random' ? 'primary' : 'default'}
              onClick={() => setStudyMode('random')}
              variant={studyMode === 'random' ? 'filled' : 'outlined'}
            />
          </Stack>
        </Box>

        {/* Flashcard with Navigation Arrows */}
        {currentCard && (
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', mb: 3 }}>
            {/* Left Arrow */}
            <IconButton 
              onClick={handlePreviousCard}
              disabled={!session || session.currentCardIndex <= 0}
              sx={{ 
                color: '#7b8ec8',
                mr: 2,
                bgcolor: 'rgba(168, 184, 240, 0.1)',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(168, 184, 240, 0.2)',
                  transform: 'scale(1.1)',
                },
                '&:disabled': {
                  color: 'rgba(123, 142, 200, 0.3)',
                  bgcolor: 'transparent',
                  borderColor: 'rgba(168, 184, 240, 0.1)',
                }
              }}
            >
              <NavigateBefore />
            </IconButton>

            {/* Flashcard */}
            <Box 
              onClick={handleFlipCard}
              sx={{ 
                flex: 1,
                height: 300,
                perspective: '1000px',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: session?.showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  animation: isCardChanging ? 'cardSpin 0.6s ease-in-out' : 'none',
                  '@keyframes cardSpin': {
                    '0%': { transform: 'rotateY(0deg) scale(1)' },
                    '50%': { transform: 'rotateY(90deg) scale(0.8)' },
                    '100%': { transform: 'rotateY(0deg) scale(1)' }
                  },
                  '&:hover': {
                    transform: session?.showAnswer 
                      ? 'rotateY(180deg) scale(1.02)' 
                      : 'rotateY(0deg) scale(1.02)',
                  }
                }}
              >
                {/* Front of Card */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: '#ffffff',
                    border: '2px solid rgba(168, 184, 240, 0.3)',
                    boxShadow: '0 8px 32px rgba(168, 184, 240, 0.2)',
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center' 
                  }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="#6B7280" gutterBottom fontWeight={600}>
                        Card {(session?.currentCardIndex || 0) + 1} of {session?.totalCards}
                      </Typography>
                      {currentCard.difficulty && (
                        <Chip 
                          label={currentCard.difficulty.toUpperCase()} 
                          size="small" 
                          color={
                            currentCard.difficulty === 'easy' ? 'success' :
                            currentCard.difficulty === 'medium' ? 'warning' : 'error'
                          }
                          sx={{ mb: 2 }}
                        />
                      )}
                    </Box>

                    <Typography variant="h5" color="#1F2937" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                      <Quiz sx={{ mr: 1, verticalAlign: 'middle', color: '#7b8ec8' }} />
                      {currentCard.front}
                    </Typography>

                    {!session?.showAnswer && (
                      <Typography variant="body2" color="#6B7280" sx={{ fontStyle: 'italic' }}>
                        Click to flip
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Back of Card */}
                <Card
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(76,175,80,0.04) 100%)',
                    border: '2px solid rgba(76,175,80,0.3)',
                    boxShadow: '0 8px 32px rgba(76,175,80,0.2)',
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    overflow: 'auto'
                  }}>
                    <Typography variant="body2" color="#6B7280" gutterBottom fontWeight={600}>
                      Answer:
                    </Typography>
                    <Typography variant="h6" color="#1F2937" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                      {currentCard.back}
                    </Typography>
                    
                    {/* Additional Information */}
                    {(currentCard.wordclass || currentCard.definition || currentCard.example) && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(168, 184, 240, 0.2)' }}>
                        {currentCard.wordclass && (
                          <Typography variant="body2" color="#4B5563" gutterBottom>
                            <strong>Word Class:</strong> {currentCard.wordclass}
                          </Typography>
                        )}
                        {currentCard.definition && (
                          <Typography variant="body2" color="#4B5563" gutterBottom>
                            <strong>Definition:</strong> {currentCard.definition}
                          </Typography>
                        )}
                        {currentCard.example && (
                          <Typography variant="body2" color="#4B5563">
                            <strong>Example:</strong> {currentCard.example}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>          {/* Right Arrow */}
          <IconButton 
            onClick={handleNextCard}
            disabled={!session || session.currentCardIndex >= flashcards.length - 1}
            sx={{ 
              color: '#7b8ec8',
              ml: 2,
              bgcolor: 'rgba(168, 184, 240, 0.1)',
              border: '1px solid rgba(168, 184, 240, 0.2)',
              '&:hover': {
                bgcolor: 'rgba(168, 184, 240, 0.2)',
                transform: 'scale(1.1)',
              },
              '&:disabled': {
                color: 'rgba(123, 142, 200, 0.3)',
                bgcolor: 'transparent',
                borderColor: 'rgba(168, 184, 240, 0.1)',
              }
            }}
          >
            <NavigateNext />
          </IconButton>
        </Box>
        )}

        {/* Action Buttons */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 3,
            background: '#ffffff',
            border: '1px solid rgba(168, 184, 240, 0.2)',
            borderRadius: 3,
          }}
        >
          {session?.showAnswer ? (
            <Box>
              <Typography variant="h6" color="#1F2937" textAlign="center" gutterBottom fontWeight={600}>
                How well did you know this?
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => handleAnswerFeedback(false)}
                  sx={{ 
                    minWidth: 120,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)'
                    }
                  }}
                >
                  Didn't Know (1)
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => handleAnswerFeedback(true)}
                  sx={{ 
                    minWidth: 120,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)'
                    }
                  }}
                >
                  Knew It (2)
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="#1F2937" fontWeight={600}>
                Click the flashcard to flip and see the answer
              </Typography>
            </Box>
          )}

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRestart}
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
                Restart (R)
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/decks')}
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
            </Stack>
          </Box>
        </Paper>

        {/* Current Stats */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 2, 
            mt: 3,
            background: '#ffffff',
            border: '1px solid rgba(168, 184, 240, 0.2)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <Box>
              <Typography variant="h6" color="#4caf50" fontWeight={700}>
                {session?.correctAnswers || 0}
              </Typography>
              <Typography variant="body2" color="#6B7280" fontWeight={600}>
                Correct
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="#f44336" fontWeight={700}>
                {session?.incorrectAnswers || 0}
              </Typography>
              <Typography variant="body2" color="#6B7280" fontWeight={600}>
                Incorrect
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="#1F2937" fontWeight={700}>
                {Math.round(getScorePercentage())}%
              </Typography>
              <Typography variant="body2" color="#6B7280" fontWeight={600}>
                Score
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Completion Dialog */}
      <Dialog 
        open={showCompletionDialog} 
        onClose={() => setShowCompletionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            border: '2px solid rgba(168, 184, 240, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#1F2937' }}>
          <EmojiEvents sx={{ fontSize: 48, color: '#ffd700', mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>Study Session Complete!</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', color: '#1F2937' }}>
            <Typography variant="h4" color="#ffd700" gutterBottom fontWeight={700}>
              {Math.round(getScorePercentage())}%
            </Typography>
            <Typography variant="h6" gutterBottom color="#4B5563" fontWeight={600}>
              {getPerformanceMessage().message}
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', minWidth: 80 }}>
                <Typography variant="h6" color="#4caf50" fontWeight={700}>
                  {session?.correctAnswers}
                </Typography>
                <Typography variant="body2" color="#6B7280" fontWeight={600}>
                  Correct
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)', minWidth: 80 }}>
                <Typography variant="h6" color="#f44336" fontWeight={700}>
                  {session?.incorrectAnswers}
                </Typography>
                <Typography variant="body2" color="#6B7280" fontWeight={600}>
                  Incorrect
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'rgba(168, 184, 240, 0.1)', border: '1px solid rgba(168, 184, 240, 0.3)', minWidth: 80 }}>
                <Typography variant="h6" color="#1F2937" fontWeight={700}>
                  {formatStudyTime()}
                </Typography>
                <Typography variant="body2" color="#6B7280" fontWeight={600}>
                  Time
                </Typography>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleRestart}
            startIcon={<Refresh />}
            sx={{ mr: 1 }}
          >
            Study Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/decks')}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: 'white' }
            }}
          >
            Back to Decks
          </Button>
        </DialogActions>
      </Dialog>
    </GlassBackground>
  );
};

export default StudyFlashcardsPage;
