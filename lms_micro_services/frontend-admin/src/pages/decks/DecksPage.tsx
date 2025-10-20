import React, { useState } from 'react';
import {
  Container,
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
  MenuItem
} from '@mui/material';
import { Add, Style, School, Visibility, Edit, Delete, MoreVert, Person, CalendarToday } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { contentService, Deck, CreateDeckRequest } from '../../services/content.service';
import { assignmentService } from '../../services/assignment.service';
import { RoleBasedComponent } from '../../components/common/RoleBasedComponent';
import { useAuth } from '../../context/AuthContext';
import { GlassBackground, GlassHeader, GlassPaper } from '../../components/common/GlassTheme';

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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <GlassPaper>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontSize: '2rem', mb: 2, color: 'white' }}>
                Loading Your Decks...
              </Typography>
            </Box>
          </GlassPaper>
        </Container>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <Container maxWidth="lg">
        {/* Header */}
        <GlassHeader
          icon="🃏"
          title="Flashcard Decks"
          subtitle="Create, manage, and study your flashcard collections"
        >
          <Box display="flex" gap={2}>
            <RoleBasedComponent allowedRoles={['TEACHER', 'ADMIN']}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenCreateDialog(true)}
                size="large"
                sx={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create Deck
              </Button>
              <Button
                variant="contained"
                startIcon={<School />}
                onClick={() => navigate('/decks/ai-creator')}
                size="large"
                sx={{
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#6d28d9',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Create with AI
              </Button>
            </RoleBasedComponent>
          </Box>
        </GlassHeader>

      {/* Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4
        }}
      >
        <Card 
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#cbd5e1',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Style sx={{ 
                mr: 2, 
                fontSize: 30,
                color: '#2563eb'
              }} />
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: '#0f172a'
                }}>
                  {decksData?.decks?.length || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b'
                }}>
                  Total Decks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card 
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#cbd5e1',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <School sx={{ 
                mr: 2, 
                fontSize: 30,
                color: '#10b981'
              }} />
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: '#0f172a'
                }}>
                  {decksData?.decks?.reduce((acc, deck) => acc + (deck.total_flashcards || 0), 0) || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b'
                }}>
                  Total Cards
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card 
          elevation={0}
          sx={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              borderColor: '#cbd5e1',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center">
              <Visibility sx={{ 
                mr: 2, 
                fontSize: 30,
                color: '#7c3aed'
              }} />
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: '#0f172a'
                }}>
                  {decksData?.decks?.filter(deck => deck.is_published || deck.is_public).length || 0}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: '#64748b'
                }}>
                  Public Decks
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Decks List */}
      {(!decksData?.decks || decksData.decks.length === 0) ? (
        <GlassPaper>
          <Box sx={{ textAlign: 'center', mt: 6, p: 6 }}>
          <Box
            sx={{
              backgroundColor: '#eff6ff',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Style sx={{ fontSize: 40, color: '#2563eb' }} />
          </Box>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: '#0f172a',
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
                backgroundColor: '#2563eb',
                borderRadius: 25,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Create Your First Deck
            </Button>
          </RoleBasedComponent>
          </Box>
        </GlassPaper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3
          }}
        >
          {Array.from({ length: 2 }, (_, colIndex) => {
            const startIndex = colIndex * Math.ceil(decksData.decks.length / 2);
            const endIndex = startIndex + Math.ceil(decksData.decks.length / 2);
            const columnDecks = decksData.decks.slice(startIndex, endIndex);
            
            return (
              <GlassPaper 
                key={colIndex}
              >
                <Box
                  sx={{ 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: 3,
                    border: '1px solid #bfdbfe',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                <List sx={{ p: 2 }}>
                  {columnDecks.map((deck: Deck, index: number) => (
                    <React.Fragment key={deck.id}>
                      <ListItem
                        onClick={() => handleDeckClick(deck.id)}
                        sx={{
                          py: 2,
                          px: 3,
                          borderRadius: 2,
                          mb: 1.5,
                          backgroundColor: clickedDecks.has(deck.id)
                            ? '#dbeafe'
                            : 'rgba(255, 255, 255, 0.7)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid',
                          borderColor: clickedDecks.has(deck.id) 
                            ? '#93c5fd'
                            : 'rgba(191, 219, 254, 0.5)',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: clickedDecks.has(deck.id)
                              ? '#bfdbfe'
                              : 'rgba(239, 246, 255, 0.9)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        <Avatar
                          sx={{
                            backgroundColor: clickedDecks.has(deck.id) 
                              ? '#1d4ed8' 
                              : '#2563eb',
                            mr: 2,
                            width: 48,
                            height: 48,
                            border: '2px solid #e2e8f0',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Style />
                        </Avatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              <Typography 
                                variant="h6" 
                                component="span" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  mr: 1,
                                  color: '#0f172a',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {deck.title}
                              </Typography>
                              <Chip
                                size="small"
                                label={deck.difficulty || 'No difficulty'}
                                color={getDifficultyColor(deck.difficulty)}
                                sx={{ 
                                  mr: 1,
                                  transition: 'all 0.2s ease'
                                }}
                              />
                              <Chip
                                size="small"
                                label={`${deck.total_flashcards || 0} cards`}
                                variant="outlined"
                                sx={{ 
                                  mr: 1,
                                  borderColor: '#cbd5e1',
                                  color: '#64748b',
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
                                    backdropFilter: clickedDecks.has(deck.id) ? 'blur(10px)' : 'none',
                                    background: clickedDecks.has(deck.id) 
                                      ? 'rgba(255,255,255,0.2)' 
                                      : undefined,
                                    border: clickedDecks.has(deck.id) 
                                      ? '1px solid rgba(255,255,255,0.4)' 
                                      : undefined,
                                    color: clickedDecks.has(deck.id) ? 'rgba(255,255,255,0.9)' : undefined,
                                    transition: 'all 0.3s ease'
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 1,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  color: '#64748b',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {deck.description || 'No description available'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {deck.instructor_name && (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Person sx={{ fontSize: 14, mr: 0.5, color: '#64748b' }} />
                                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                                      Instructor: {deck.instructor_name}
                                    </Typography>
                                  </Box>
                                )}
                                <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<Visibility />}
                                    onClick={() => handleViewDeck(deck.id)}
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      minWidth: 'auto',
                                      px: 2,
                                      py: 1,
                                      backgroundColor: '#2563eb',
                                      color: '#ffffff',
                                      borderRadius: 20,
                                      '&:hover': {
                                        backgroundColor: '#1d4ed8',
                                        transform: 'scale(1.05)',
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<School />}
                                    onClick={() => handleStudyDeck(deck.id)}
                                    sx={{ 
                                      fontSize: '0.75rem',
                                      minWidth: 'auto',
                                      px: 2,
                                      py: 1,
                                      backgroundColor: '#7c3aed',
                                      color: '#ffffff',
                                      borderRadius: 20,
                                      '&:hover': {
                                        backgroundColor: '#6d28d9',
                                        transform: 'scale(1.05)',
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
                            backgroundColor: '#e2e8f0',
                            height: 2,
                            borderRadius: 1
                          }} 
                        />
                      )}
                    </React.Fragment>
                  ))}
                </List>
                </Box>
              </GlassPaper>
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
        <MenuItem onClick={() => {
          if (selectedDeck) {
            navigate(`/decks/ai-flashcard-creator?deckId=${selectedDeck.id}`);
          }
          handleMenuClose();
        }}>
          <School sx={{ mr: 1 }} />
          Add AI Flashcard
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
      </Container>
    </GlassBackground>
  );
};

export default DecksPage;
