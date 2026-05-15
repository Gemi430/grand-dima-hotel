import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';
import { useSocket } from '../contexts/SocketContext';
import { useRoomStatusUpdates, useReservationUpdates } from '../hooks/useRealtimeUpdates';
import toast from 'react-hot-toast';

interface CalendarDay {
  date: string;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  status: 'available' | 'limited' | 'full';
}

interface AvailabilityCalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  onDateSelect,
  selectedDate,
}) => {
  const { isConnected } = useSocket();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedDates, setUpdatedDates] = useState<Set<string>>(new Set());

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/rooms/availability/calendar?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCalendarData(result.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch calendar data');
        toast.error('Failed to load availability calendar');
      }
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Error loading calendar data');
      toast.error('Error loading calendar data');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Subscribe to real-time room status updates
  const handleRoomStatusUpdate = useCallback(() => {
    // Refresh calendar when room status changes
    fetchCalendarData();
  }, [fetchCalendarData]);

  useRoomStatusUpdates(handleRoomStatusUpdate, { showToast: false });

  // Subscribe to real-time reservation updates
  const handleReservationUpdate = useCallback(() => {
    // Refresh calendar when reservations change
    fetchCalendarData();
  }, [fetchCalendarData]);

  useReservationUpdates(handleReservationUpdate, { showToast: false });

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get calendar day data
  const getCalendarDayData = (date: Date): CalendarDay | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return calendarData.find((day) => day.date === dateStr) || null;
  };

  // Get status color
  const getStatusColor = (status: 'available' | 'limited' | 'full'): string => {
    switch (status) {
      case 'available':
        return '#4caf50'; // green
      case 'limited':
        return '#ff9800'; // orange
      case 'full':
        return '#f44336'; // red
      default:
        return '#9e9e9e'; // grey
    }
  };

  // Get status icon
  const getStatusIcon = (status: 'available' | 'limited' | 'full') => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon fontSize="small" />;
      case 'limited':
        return <WarningIcon fontSize="small" />;
      case 'full':
        return <BlockIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Generate calendar days
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = start.getDay();

  // Create empty cells for days before the first day of the month
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Availability Calendar</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip
            icon={isConnected ? <CheckCircleIcon /> : <BlockIcon />}
            label={isConnected ? 'Live' : 'Offline'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
        </Box>
      </Box>

      {/* Month Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <IconButton onClick={handlePreviousMonth} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6">{format(currentMonth, 'MMMM yyyy')}</Typography>
        <IconButton onClick={handleNextMonth} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Legend */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Chip
          icon={<CheckCircleIcon />}
          label="Available (< 70%)"
          size="small"
          sx={{ bgcolor: '#e8f5e9' }}
        />
        <Chip
          icon={<WarningIcon />}
          label="Limited (70-99%)"
          size="small"
          sx={{ bgcolor: '#fff3e0' }}
        />
        <Chip
          icon={<BlockIcon />}
          label="Full (100%)"
          size="small"
          sx={{ bgcolor: '#ffebee' }}
        />
      </Box>

      {/* Calendar Grid */}
      <Grid container spacing={1}>
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item xs={12 / 7} key={day}>
            <Box textAlign="center" py={1}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}

        {/* Empty cells before first day */}
        {emptyCells.map((i) => (
          <Grid item xs={12 / 7} key={`empty-${i}`}>
            <Box height="80px" />
          </Grid>
        ))}

        {/* Calendar days */}
        {days.map((day) => {
          const dayData = getCalendarDayData(day);
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isTodayDate = isToday(day);

          return (
            <Grid item xs={12 / 7} key={day.toISOString()}>
              <Tooltip
                title={
                  dayData
                    ? `${dayData.availableRooms} / ${dayData.totalRooms} available (${dayData.occupancyRate}% occupied)`
                    : 'No data'
                }
                arrow
              >
                <Card
                  sx={{
                    height: '80px',
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    bgcolor: dayData ? getStatusColor(dayData.status) + '20' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                  }}
                  onClick={() => handleDateClick(day)}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box display="flex" flexDirection="column" height="100%">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="body2"
                          fontWeight={isTodayDate ? 'bold' : 'normal'}
                          color={isTodayDate ? 'primary' : 'text.primary'}
                        >
                          {format(day, 'd')}
                        </Typography>
                        {dayData && (
                          <Box sx={{ color: getStatusColor(dayData.status) }}>
                            {getStatusIcon(dayData.status)}
                          </Box>
                        )}
                      </Box>
                      {dayData && (
                        <Box mt="auto">
                          <Typography variant="caption" display="block" color="text.secondary">
                            {dayData.availableRooms} avail
                          </Typography>
                          <Typography variant="caption" display="block" fontWeight="bold">
                            {dayData.occupancyRate}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary Statistics */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="success.main">
                  {calendarData.filter((d) => d.status === 'available').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Available Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="warning.main">
                  {calendarData.filter((d) => d.status === 'limited').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Limited Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" color="error.main">
                  {calendarData.filter((d) => d.status === 'full').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Full Days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

