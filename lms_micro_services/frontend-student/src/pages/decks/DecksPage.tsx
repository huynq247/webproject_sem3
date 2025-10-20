import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  Grow,
} from '@mui/material';
import { Add, Style, School, Visibility, Edit, Delete, MoreVert, Person, CalendarToday } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { contentService, Deck, CreateDeckRequest } from '../../services/content.service';
import { assignmentService } from '../../services/assignment.service';
import { RoleBasedComponent } from '../../components/common/RoleBasedComponent';
import { useAuth } from '../../context/AuthContext';
import { GlassBackground } from '../../components/common/GlassTheme';

const DecksPage: React.FC = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [error, setError] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [clickedDecks, setClickedDecks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDeckRequest>();

  // Fetch decks (backend now handles role-based filtering)
  const { data: decksData, isLoading } = useQuery({
    queryKey: ['decks', user?.role, user?.id],
    queryFn: contentService.getDecks,
    enabled: !!user,
  });

  // Create deck mutation
  const createDeckMutation = useMutation({
    mutationFn: contentService.createDeck,
    onSuccess: (data) => {
      console.log('✅ Deck created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      setOpenCreateDialog(false);
      reset();
      setError('');
    },
    onError: (err: any) => {
      console.error('❌ Deck creation failed:', err);
      setError(err.message || 'Failed to create deck');
    },
  });

  // Delete deck mutation
  const deleteDeckMutation = useMutation({
    mutationFn: (deckId: string) => contentService.deleteDeck(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] });
    },
  });

  const handleCreateDeck = (data: CreateDeckRequest) => {
    const deckData = {
      ...data,
      instructor_id: Number(user?.id || 0)
    };
    createDeckMutation.mutate(deckData);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this deck?')) {
      deleteDeckMutation.mutate(deckId);
    }
  };

  const handleViewDeck = (deckId: string) => {
    navigate(`/decks/${deckId}`);
  };

  const handleStudyDeck = (deckId: string) => {
    navigate(`/decks/${deckId}/study`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, deck: Deck) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeck(deck);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeck(null);
  };

  const handleEditDeck = () => {
    if (selectedDeck) {
      setEditTitle(selectedDeck.title);
      setEditDescription(selectedDeck.description || '');
      setEditIsPublic(selectedDeck.is_published || selectedDeck.is_public || false);
      setOpenEditDialog(true);
    }
    setAnchorEl(null); // Chỉ đóng menu, không reset selectedDeck
  };

  const handleUpdateDeck = async () => {
    if (!selectedDeck) return;
    
    if (!editTitle.trim()) {
      alert('Deck title is required');
      return;
    }
    
    try {
      console.log('Updating deck:', {
        id: selectedDeck.id,
        title: editTitle,
        description: editDescription,
        is_published: editIsPublic
      });
      
      const result = await contentService.updateDeck(selectedDeck.id, {
        title: editTitle,
        description: editDescription,
        is_published: editIsPublic  // Sửa từ is_public thành is_published
      });
      
      console.log('Deck updated successfully:', result);
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
      setOpenEditDialog(false);
      setSelectedDeck(null);
      alert('Deck updated successfully!');
    } catch (error) {
      console.error('Error updating deck:', error);
      alert('Error updating deck: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleDeleteDeckFromMenu = () => {
    if (selectedDeck) {
      handleDeleteDeck(selectedDeck.id);
    }
    handleMenuClose();
  };

  // Handle deck click for glass effect
  const handleDeckClick = (deckId: string) => {
    setClickedDecks(prev => new Set(prev).add(deckId));
    // Remove glass effect after 2 seconds
    setTimeout(() => {
      setClickedDecks(prev => {
        const newSet = new Set(prev);
        newSet.delete(deckId);
        return newSet;
      });
    }, 2000);
  };

  const canEditDelete = (deck: Deck) => {
    return user?.role === 'ADMIN' || (user?.role === 'TEACHER' && deck.instructor_id === String(user?.id));
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

  if (isLoading) {
    return (
      <GlassBackground>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            Loading Your Decks...
          </Typography>
        </Box>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 800,
            color: '#7b8ec8',
          }}>
            🃏 Flashcard Decks
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            mb: 2,
            color: '#6B7280',
            fontSize: '1.1rem'
          }}>
            Create, manage, and study your flashcard collections
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center">
            <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenCreateDialog(true)}
                size="large"
                sx={{
                  background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                  boxShadow: '0 3px 5px 2px rgba(30, 60, 114, .3)',
                  borderRadius: 25,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2a5298 30%, #19547b 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .3)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Create New Deck
              </Button>
            </RoleBasedComponent>
          </Box>
        </Box>

        {/* Stats */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4
          }}
        >
          <Fade in timeout={600}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Style sx={{ mr: 2, color: '#64B5F6', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {decksData?.decks?.length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    Total Decks
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
          <Fade in timeout={700}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <School sx={{ mr: 2, color: '#81C784', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {decksData?.decks?.reduce((acc, deck) => acc + (deck.total_flashcards || 0), 0) || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    Total Cards
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
          <Fade in timeout={800}>
            <Paper
              elevation={2}
              sx={{
                background: '#ffffff',
                border: '1px solid rgba(168, 184, 240, 0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(168, 184, 240, 0.25)',
                  borderColor: '#a8b8f0',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Visibility sx={{ mr: 2, color: '#BA68C8', fontSize: '2.5rem' }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontSize: '2rem', 
                    fontWeight: 800, 
                    color: '#1F2937',
                  }}>
                    {decksData?.decks?.filter(deck => deck.is_published || deck.is_public).length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 600, 
                    color: '#6B7280',
                  }}>
                    Public Decks
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
      </Box>

      {/* Decks List */}
      {(!decksData?.decks || decksData.decks.length === 0) ? (
        <Grow in timeout={1000}>
          <Paper
            elevation={2}
            sx={{
              background: '#ffffff',
              border: '1px solid rgba(168, 184, 240, 0.2)',
              borderRadius: 3,
              textAlign: 'center',
              mt: 4,
              p: 6
            }}
          >
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
            }}
          >
            <Style sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #1e3c72, #2a5298)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            No Decks Available
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Create your first flashcard deck to start studying!
          </Typography>
          <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                borderRadius: 25,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(30, 60, 114, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2a5298 30%, #19547b 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(30, 60, 114, .4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Create Your First Deck
            </Button>
            </RoleBasedComponent>
          </Paper>
        </Grow>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            '& > *': {
              minWidth: 0, // Prevent grid items from overflowing
            }
          }}
        >
          {Array.from({ length: 2 }, (_, colIndex) => {
            const startIndex = colIndex * Math.ceil(decksData.decks.length / 2);
            const endIndex = startIndex + Math.ceil(decksData.decks.length / 2);
            const columnDecks = decksData.decks.slice(startIndex, endIndex);
            
            return (
              <Grow in timeout={1000 + colIndex * 200} key={colIndex}>
                <Paper
                  elevation={2}
                  sx={{
                    background: '#ffffff',
                    border: '1px solid rgba(168, 184, 240, 0.2)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(168, 184, 240, 0.1)',
                  }}
                >
                <Box
                  sx={{ 
                    background: '#ffffff',
                    borderRadius: 2,
                    border: 'none',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                <List sx={{ p: 1 }}>
                  {columnDecks.map((deck: Deck, index: number) => (
                    <React.Fragment key={deck.id}>
                      <ListItem
                        onClick={() => handleDeckClick(deck.id)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderRadius: 2,
                          mb: 1,
                          mx: 0.5,
                          background: clickedDecks.has(deck.id)
                            ? 'rgba(168, 184, 240, 0.15)'
                            : '#ffffff',
                          border: '1px solid rgba(168, 184, 240, 0.2)',
                          backdropFilter: clickedDecks.has(deck.id) ? 'blur(15px)' : 'none',
                          boxShadow: clickedDecks.has(deck.id)
                            ? '0 4px 20px rgba(168, 184, 240, 0.2)'
                            : 'none',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          '&:hover': {
                            background: 'rgba(168, 184, 240, 0.08)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 2px 8px rgba(168, 184, 240, 0.15)',
                            borderColor: '#a8b8f0',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Avatar
                          sx={{
                            background: getDifficultyColor(deck.difficulty) === 'success' 
                              ? 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)' 
                              : getDifficultyColor(deck.difficulty) === 'warning' 
                              ? 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)'
                              : getDifficultyColor(deck.difficulty) === 'error' 
                              ? 'linear-gradient(135deg, #E57373 0%, #EF5350 100%)' 
                              : 'linear-gradient(135deg, #a8b8f0 0%, #7b8ec8 100%)',
                            mr: 1.5,
                            width: 40,
                            height: 40,
                            boxShadow: '0 2px 8px rgba(168, 184, 240, 0.2)',
                            border: '2px solid #ffffff',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Style sx={{ fontSize: 20, color: '#ffffff' }} />
                        </Avatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
                              <Typography 
                                variant="body1" 
                                component="span" 
                                sx={{ 
                                  fontWeight: 600, 
                                  mr: 1,
                                  color: '#1F2937',
                                  fontSize: '0.9rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '120px'
                                }}
                              >
                                {deck.title}
                              </Typography>
                              <Chip
                                size="small"
                                label={deck.difficulty || 'No difficulty'}
                                color={getDifficultyColor(deck.difficulty)}
                                sx={{ 
                                  mr: 0.5,
                                  fontSize: '0.65rem',
                                  height: '20px',
                                  transition: 'all 0.2s ease'
                                }}
                              />
                              <Chip
                                size="small"
                                label={`${deck.total_flashcards || 0} cards`}
                                variant="outlined"
                                sx={{ 
                                  mr: 0.5,
                                  fontSize: '0.65rem',
                                  height: '20px',
                                  color: '#4B5563',
                                  borderColor: 'rgba(168, 184, 240, 0.4)',
                                  transition: 'all 0.2s ease'
                                }}
                              />
                              {(deck.is_published || deck.is_public) && (
                                <Chip
                                  size="small"
                                  label="Public"
                                  color="info"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    height: '20px',
                                    backdropFilter: clickedDecks.has(deck.id) ? 'blur(8px)' : 'none',
                                    color: '#4B5563',
                                    borderColor: 'rgba(168, 184, 240, 0.4)',
                                    transition: 'all 0.2s ease'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 0.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  color: '#6B7280',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {deck.description || 'No description available'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                {deck.instructor_name && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                    <Person sx={{ fontSize: 12, mr: 0.3, color: 'rgba(255,255,255,0.7)' }} />
                                    <Typography 
                                      variant="caption" 
                                      sx={{ 
                                        color: 'rgba(255,255,255,0.7)',
                                        fontSize: '0.65rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '80px'
                                      }}
                                    >
                                      {deck.instructor_name}
                                    </Typography>
                                  </Box>
                                )}
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Visibility sx={{ fontSize: 14 }} />}
                                    onClick={() => handleViewDeck(deck.id)}
                                    sx={{ 
                                      fontSize: '0.65rem',
                                      minWidth: 'auto',
                                      px: 1.5,
                                      py: 0.5,
                                      height: '24px',
                                      background: 'linear-gradient(135deg, #a8b8f0 0%, #7b8ec8 100%)',
                                      borderRadius: 12,
                                      color: '#ffffff',
                                      fontWeight: 600,
                                      boxShadow: '0 2px 8px rgba(168, 184, 240, 0.3)',
                                      '&:hover': {
                                        background: 'linear-gradient(135deg, #7b8ec8 0%, #6674a8 100%)',
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 4px 12px rgba(168, 184, 240, 0.4)',
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<School sx={{ fontSize: 14 }} />}
                                    onClick={() => handleStudyDeck(deck.id)}
                                    sx={{ 
                                      fontSize: '0.65rem',
                                      minWidth: 'auto',
                                      px: 1.5,
                                      py: 0.5,
                                      height: '24px',
                                      borderColor: '#a8b8f0',
                                      color: '#7b8ec8',
                                      fontWeight: 600,
                                      borderRadius: 12,
                                      '&:hover': {
                                        borderColor: '#7b8ec8',
                                        background: 'rgba(168, 184, 240, 0.1)',
                                        transform: 'scale(1.02)',
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    Study
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {canEditDelete(deck) && (
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, deck)}
                                sx={{ ml: 1 }}
                              >
                                <MoreVert />
                              </IconButton>
                            )}
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < columnDecks.length - 1 && (
                        <Divider 
                          sx={{ 
                            mx: 2,
                            background: 'linear-gradient(90deg, rgba(30,60,114,0.4) 0%, rgba(42,82,152,0.4) 100%)',
                            height: 2,
                            borderRadius: 1
                          }} 
                        />
                      )}
                    </React.Fragment>
                  ))}
                </List>
                </Box>
              </Paper>
                </Grow>
            );
          })}
        </Box>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)} // Chỉ đóng menu, không reset selectedDeck
      >
        <MenuItem onClick={handleEditDeck}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteDeckFromMenu} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Deck Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleCreateDeck)}>
          <DialogTitle>Create New Deck</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              autoFocus
              margin="dense"
              label="Deck Title"
              fullWidth
              variant="outlined"
              {...register('title', { required: 'Title is required' })}
              error={!!errors.title}
              helperText={errors.title?.message}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...register('description')}
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
            
            <FormControlLabel
              control={
                <Checkbox
                  {...register('is_public')}
                  defaultChecked={false}
                />
              }
              label="Make this deck public"
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createDeckMutation.isPending}>
              {createDeckMutation.isPending ? 'Creating...' : 'Create Deck'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Deck Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => {
          setOpenEditDialog(false);
          setSelectedDeck(null);
        }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
          }
        }}
      >
        <DialogTitle>Edit Deck</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Deck Title"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={editIsPublic}
                onChange={(e) => setEditIsPublic(e.target.checked)}
              />
            }
            label="Make this deck public"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditDialog(false);
            setSelectedDeck(null);
          }}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleUpdateDeck}
          >
            Update Deck
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </GlassBackground>
  );
};

export default DecksPage;
