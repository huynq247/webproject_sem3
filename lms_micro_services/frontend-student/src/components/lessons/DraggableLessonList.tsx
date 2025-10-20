import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Lesson } from '../../services/content.service';
import contentService from '../../services/content.service';

interface SortableLessonItemProps {
  lesson: Lesson;
  index: number;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
  canManage: boolean;
}

function SortableLessonItem({ lesson, index, onEdit, onDelete, canManage }: SortableLessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        border: isDragging ? '2px dashed #1976d2' : '1px solid #e0e0e0',
        backgroundColor: isDragging ? '#f5f5f5' : 'white',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1}>
          {/* Drag Handle */}
          {canManage && (
            <IconButton
              {...attributes}
              {...listeners}
              size="small"
              sx={{
                cursor: isDragging ? 'grabbing' : 'grab',
                color: 'text.secondary',
              }}
            >
              <DragIndicatorIcon />
            </IconButton>
          )}

          {/* Lesson Order */}
          <Chip
            label={lesson.order || index + 1}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ minWidth: 40 }}
          />

          {/* Lesson Content */}
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {lesson.title}
            </Typography>
          </Box>

          {/* Duration */}
          {lesson.duration && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <ScheduleIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {lesson.duration} min
              </Typography>
            </Box>
          )}

          {/* Status */}
          <Chip
            label={lesson.is_published ? 'Published' : 'Draft'}
            size="small"
            color={lesson.is_published ? 'success' : 'default'}
            variant="outlined"
          />

          {/* Action Buttons */}
          {canManage && (
            <Box display="flex" gap={1}>
              <IconButton
                size="small"
                onClick={() => onEdit?.(lesson)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete?.(lesson.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

interface DraggableLessonListProps {
  lessons: Lesson[];
  courseId: string;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
  onReorder?: () => void; // Callback to refresh lessons after reorder
  canManage: boolean;
}

export default function DraggableLessonList({
  lessons,
  courseId,
  onEdit,
  onDelete,
  onReorder,
  canManage,
}: DraggableLessonListProps) {
  const [items, setItems] = useState(lessons);
  const [isReordering, setIsReordering] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when lessons prop changes
  React.useEffect(() => {
    setItems(lessons);
  }, [lessons]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !canManage) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Prepare reorder data with new order numbers
    const reorderData = newItems.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    setIsReordering(true);

    try {
      await contentService.reorderLessons(courseId, reorderData);
      setSnackbar({
        open: true,
        message: 'Lessons reordered successfully!',
        severity: 'success',
      });
      onReorder?.(); // Refresh lessons to get updated order from backend
    } catch (error) {
      console.error('Error reordering lessons:', error);
      // Revert the local change
      setItems(lessons);
      setSnackbar({
        open: true,
        message: 'Failed to reorder lessons. Please try again.',
        severity: 'error',
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (items.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        border="2px dashed #e0e0e0"
        borderRadius={2}
        p={3}
      >
        <Typography variant="body1" color="text.secondary">
          No lessons found. {canManage && 'Add some lessons to get started!'}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <Box>
            {canManage && (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                icon={<DragIndicatorIcon />}
              >
                Drag and drop lessons to reorder them. Changes will be saved automatically.
              </Alert>
            )}
            
            {items.map((lesson, index) => (
              <SortableLessonItem
                key={lesson.id}
                lesson={lesson}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                canManage={canManage}
              />
            ))}
          </Box>
        </SortableContext>
      </DndContext>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {isReordering && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Saving new lesson order...
        </Alert>
      )}
    </>
  );
}
