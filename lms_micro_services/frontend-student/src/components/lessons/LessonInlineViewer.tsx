import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  LinearProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Timer,
  CheckCircle,
  School,
  Close,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { Lesson } from '../../services/content.service';
import { debugLog } from '../../config';

interface LessonInlineViewerProps {
  lesson: Lesson;
  onComplete?: (lessonId: string) => void;
  onClose?: () => void;
  isAssignmentContext?: boolean;
}

const LessonInlineViewer: React.FC<LessonInlineViewerProps> = ({
  lesson,
  onComplete,
  onClose,
  isAssignmentContext = false,
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(true);

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    debugLog('🎥 Video started:', lesson.title);
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    debugLog('⏸️ Video paused:', lesson.title);
  };

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    
    // Mark lesson as completed when 80% watched
    if (progress > 80 && !lessonCompleted) {
      setLessonCompleted(true);
      debugLog('✅ Lesson completed:', lesson.title);
      onComplete?.(lesson.id);
    }
  };

  const handleMarkComplete = () => {
    setLessonCompleted(true);
    onComplete?.(lesson.id);
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    
    console.log('🎥 Processing video URL (Inline):', url);
    
    // YouTube URL conversion
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;
      console.log('🎬 YouTube embed URL (Inline):', embedUrl);
      return embedUrl;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;
      console.log('🎬 YouTube short embed URL (Inline):', embedUrl);
      return embedUrl;
    }
    
    // Vimeo URL conversion
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      console.log('🎬 Vimeo embed URL (Inline):', embedUrl);
      return embedUrl;
    }
    
    // Google Drive URL conversion
    if (url.includes('drive.google.com')) {
      let fileId = '';
      
      // Handle different Google Drive URL formats
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1]?.split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1]?.split('&')[0];
      }
      
      if (fileId) {
        // Try different Google Drive embed formats
        // First try the standard preview format
        const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        console.log('🎬 Google Drive embed URL (Inline):', embedUrl);
        console.log('📝 Note: If video doesn\'t play, ensure file is shared with "Anyone with the link"');
        return embedUrl;
      }
    }
    
    // OneDrive URL conversion
    if (url.includes('onedrive.live.com') || url.includes('1drv.ms')) {
      // OneDrive requires replacing 'view' with 'embed' in the URL
      let embedUrl = url;
      if (url.includes('view.aspx')) {
        embedUrl = url.replace('view.aspx', 'embed.aspx');
      } else if (url.includes('redir?')) {
        // Handle short OneDrive links - need to get the full URL first
        embedUrl = url + '&embed=1';
      }
      console.log('🎬 OneDrive embed URL (Inline):', embedUrl);
      return embedUrl;
    }
    
    // SharePoint URL conversion
    if (url.includes('sharepoint.com')) {
      const embedUrl = url.replace('view.aspx', 'embed.aspx');
      console.log('🎬 SharePoint embed URL (Inline):', embedUrl);
      return embedUrl;
    }
    
    // Direct video URL or other platforms
    console.log('🎬 Direct video URL (Inline):', url);
    return url;
  };

  const isVideoUrl = lesson.video_url && lesson.video_url.trim() !== '';
  const isImageUrl = lesson.image_url && lesson.image_url.trim() !== '';
  const embedUrl = isVideoUrl ? getVideoEmbedUrl(lesson.video_url!) : '';

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <School sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
            {lesson.title}
          </Typography>
          
          {/* Info Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {lesson.duration && (
              <Chip 
                icon={<Timer />}
                label={`${lesson.duration} min`} 
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
            <Chip 
              label={`Lesson ${lesson.order}`} 
              size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            {lessonCompleted && (
              <Chip 
                icon={<CheckCircle />}
                label="Completed" 
                size="small"
                sx={{ backgroundColor: 'success.main', color: 'white' }}
              />
            )}
          </Box>
        </Box>
        
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {/* Video Section */}
        {isVideoUrl && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ position: 'relative', paddingTop: '40%' /* 16:10 aspect ratio for compactness */ }}>
              {/* Check if it's an embeddable platform or direct video */}
              {(embedUrl.includes('youtube.com') || 
                embedUrl.includes('vimeo.com') || 
                embedUrl.includes('drive.google.com') || 
                embedUrl.includes('onedrive.live.com') || 
                embedUrl.includes('1drv.ms') || 
                embedUrl.includes('sharepoint.com') ||
                embedUrl !== lesson.video_url // URL was converted, so it's embeddable
              ) ? (
                <iframe
                  src={embedUrl}
                  title={lesson.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => console.log('✅ Inline video iframe loaded successfully')}
                  onError={() => console.error('❌ Inline video iframe failed to load')}
                />
              ) : (
                <video
                  controls
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                  }}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onTimeUpdate={(e) => {
                    const video = e.target as HTMLVideoElement;
                    const progress = (video.currentTime / video.duration) * 100;
                    handleVideoProgress(progress);
                  }}
                >
                  <source src={lesson.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </Box>
            
            {/* Video Progress for direct videos */}
            {!embedUrl.includes('youtube.com') && !embedUrl.includes('vimeo.com') && videoProgress > 0 && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={videoProgress} 
                  sx={{ height: 4, borderRadius: 2 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Progress: {Math.round(videoProgress)}%
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Image Section */}
        {isImageUrl && !isVideoUrl && (
          <Box sx={{ mb: 2 }}>
            <img 
              src={lesson.image_url}
              alt={lesson.title}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '8px'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>
        )}

        {/* Content Section - Collapsible */}
        <Box>
          <Button
            onClick={() => setContentExpanded(!contentExpanded)}
            variant="text"
            endIcon={contentExpanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Lesson Content
          </Button>
          
          <Collapse in={contentExpanded}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.5,
                  maxHeight: '150px',
                  overflow: 'auto'
                }}
              >
                {lesson.content || 'No content available for this lesson.'}
              </Typography>
            </Paper>
          </Collapse>
        </Box>

        {/* Assignment Context Info */}
        {isAssignmentContext && (
          <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Assignment:</strong> Complete this lesson to progress in your assignment.
            </Typography>
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {!lessonCompleted && (
            <Button 
              onClick={handleMarkComplete}
              variant="contained"
              size="small"
              startIcon={<CheckCircle />}
              color="success"
            >
              Mark Complete
            </Button>
          )}
          
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outlined"
              size="small"
            >
              Close
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default LessonInlineViewer;
