import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Autocomplete,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Person as PersonIcon,
  Hotel as HotelIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  useReservationUpdates,
  ReservationUpdate,
} from '../hooks/useRealtimeUpdates';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

interface Reservation {
  _id: string;
  reservationNumber: string;
  guestId: {
    _id: string;
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  roomId: {
    _id: string;
    roomNumber: string;
    roomType: {
      name: string;
    };
  };
  status: string;
  dates: {
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  guestDetails: {
    primaryGuest: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    totalGuests: number;
    children: number;
    adults: number;
  };
  roomDetails: {
    roomNumber: string;
    roomType: string;
    dailyRate: number;
  };
  pricing: {
    roomCharges: number;
    taxes: number;
    fees: number;
    discounts: number;
    totalAmount: number;
    currency: string;
  };
  payment: {
    method: string;
    status: string;
    transactions: Array<{
      transactionId: string;
      amount: number;
      type: string;
      method: string;
      processedAt: string;
    }>;
  };
  source: string;
  checkInOut: {
    actualCheckIn?: string;
    actualCheckOut?: string;
    checkedInBy?: string;
    checkedOutBy?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Guest {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

interface Room {
  _id: string;
  roomNumber: string;
  roomType: {
    name: string;
    basePrice: number;
  };
  status: string;
}

export const ReservationsPage: React.FC = () => {
  const { isConnected } = useSocket();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | 'cancel' | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [recentlyUpdatedReservations, setRecentlyUpdatedReservations] = useState<Set<string>>(new Set());
  const [createReservationOpen, setCreateReservationOpen] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [creatingReservation, setCreatingReservation] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    guestId: '',
    roomId: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: 1,
    children: 0,
    paymentMethod: 'credit_card',
    source: 'direct',
    specialRequests: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch reservations
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/reservations?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReservations(data.data || []);
      } else {
        toast.error('Failed to fetch reservations');
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Error fetching reservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Apply filters
  useEffect(() => {
    let filtered = [...reservations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reservation.guestDetails.primaryGuest.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reservation.guestDetails.primaryGuest.lastName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reservation.roomDetails.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((reservation) => reservation.status === statusFilter);
    }

    setFilteredReservations(filtered);
  }, [reservations, searchQuery, statusFilter]);

  // Fetch guests for booking form
  const fetchGuests = async () => {
    try {
      setLoadingGuests(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/guests?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGuests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoadingGuests(false);
    }
  };

  // Fetch available rooms for booking form
  const fetchAvailableRooms = async (checkIn: string, checkOut: string) => {
    try {
      setLoadingRooms(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableRooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Failed to fetch available rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  // Handle open create reservation dialog
  const handleOpenCreateReservation = () => {
    setCreateReservationOpen(true);
    fetchGuests();
    fetchAvailableRooms(bookingForm.checkIn, bookingForm.checkOut);
  };

  // Handle close create reservation dialog
  const handleCloseCreateReservation = () => {
    setCreateReservationOpen(false);
    setBookingForm({
      guestId: '',
      roomId: '',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      adults: 1,
      children: 0,
      paymentMethod: 'credit_card',
      source: 'direct',
      specialRequests: '',
    });
  };

  // Handle booking form change
  const handleBookingFormChange = (field: string, value: any) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));

    // Refresh available rooms when dates change
    if (field === 'checkIn' || field === 'checkOut') {
      const newForm = { ...bookingForm, [field]: value };
      if (newForm.checkIn && newForm.checkOut) {
        fetchAvailableRooms(newForm.checkIn, newForm.checkOut);
      }
    }
  };

  // Calculate nights and pricing
  const calculateBookingDetails = () => {
    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const selectedRoom = availableRooms.find((r) => r._id === bookingForm.roomId);
    const dailyRate = selectedRoom?.roomType.basePrice || 0;
    const roomCharges = dailyRate * nights;
    const taxes = roomCharges * 0.1; // 10% tax
    const fees = 20; // Fixed service fee
    const totalAmount = roomCharges + taxes + fees;

    return {
      nights,
      dailyRate,
      roomCharges,
      taxes,
      fees,
      totalAmount,
    };
  };

  // Handle create reservation
  const handleCreateReservation = async () => {
    try {
      setCreatingReservation(true);
      const token = localStorage.getItem('token');

      const selectedGuest = guests.find((g) => g._id === bookingForm.guestId);
      const selectedRoom = availableRooms.find((r) => r._id === bookingForm.roomId);

      if (!selectedGuest || !selectedRoom) {
        toast.error('Please select both guest and room');
        return;
      }

      const bookingDetails = calculateBookingDetails();

      const payload = {
        guestId: bookingForm.guestId,
        roomId: bookingForm.roomId,
        dates: {
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
        },
        guestDetails: {
          primaryGuest: {
            firstName: selectedGuest.personalInfo.firstName,
            lastName: selectedGuest.personalInfo.lastName,
            email: selectedGuest.personalInfo.email,
            phone: selectedGuest.personalInfo.phone,
          },
          totalGuests: bookingForm.adults + bookingForm.children,
          adults: bookingForm.adults,
          children: bookingForm.children,
        },
        payment: {
          method: bookingForm.paymentMethod,
        },
        source: bookingForm.source,
        specialRequests: bookingForm.specialRequests || undefined,
      };

      const response = await fetch('http://localhost:3001/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Reservation created successfully! Confirmation: ${result.data.reservation.reservationNumber}`);
        handleCloseCreateReservation();
        fetchReservations();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Error creating reservation');
    } finally {
      setCreatingReservation(false);
    }
  };

  // Subscribe to real-time reservation updates
  const handleReservationUpdate = useCallback((update: ReservationUpdate) => {
    // Update or add reservation in the list
    setReservations((prevReservations) => {
      const existingIndex = prevReservations.findIndex(
        (r) => r._id === update.reservationId || r.reservationNumber === update.reservationNumber
      );

      if (existingIndex >= 0) {
        // Update existing reservation
        const updated = [...prevReservations];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: update.status,
        };
        return updated;
      } else {
        // New reservation - refresh the list
        fetchReservations();
        return prevReservations;
      }
    });

    // Update selected reservation if it's the one that changed
    setSelectedReservation((prevSelected) =>
      prevSelected &&
      (prevSelected._id === update.reservationId ||
        prevSelected.reservationNumber === update.reservationNumber)
        ? { ...prevSelected, status: update.status }
        : prevSelected
    );

    // Mark reservation as recently updated for visual indicator
    setRecentlyUpdatedReservations((prev) => {
      const updated = new Set(prev);
      updated.add(update.reservationId);
      return updated;
    });

    // Remove the indicator after 3 seconds
    setTimeout(() => {
      setRecentlyUpdatedReservations((prev) => {
        const updated = new Set(prev);
        updated.delete(update.reservationId);
        return updated;
      });
    }, 3000);
  }, [fetchReservations]);

  useReservationUpdates(handleReservationUpdate, { showToast: true });

  // Get status color
  const getStatusColor = (
    status: string
  ): 'success' | 'primary' | 'default' | 'error' | 'warning' => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'checked_in':
        return 'primary';
      case 'checked_out':
        return 'default';
      case 'cancelled':
      case 'no_show':
        return 'error';
      default:
        return 'warning';
    }
  };

  // Open reservation details
  const handleOpenDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailsOpen(true);
  };

  // Close reservation details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedReservation(null);
  };

  // Open action dialog
  const handleOpenAction = (reservation: Reservation, action: 'checkin' | 'checkout' | 'cancel') => {
    setSelectedReservation(reservation);
    setActionType(action);
    setActionDialogOpen(true);
  };

  // Close action dialog
  const handleCloseAction = () => {
    setActionDialogOpen(false);
    setSelectedReservation(null);
    setActionType(null);
    setCancelReason('');
  };

  // Perform action
  const handlePerformAction = async () => {
    if (!selectedReservation || !actionType) return;

    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      let url = `http://localhost:3001/api/reservations/${selectedReservation._id}/${actionType}`;
      let body: any = {};

      if (actionType === 'cancel') {
        body = { reason: cancelReason || 'Cancelled by staff' };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(
          `Reservation ${selectedReservation.reservationNumber} ${actionType} successful`
        );
        handleCloseAction();
        // The real-time update will handle the UI update
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${actionType} reservation`);
      }
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
      toast.error(`Error performing ${actionType}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Reservation Management
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={isConnected ? 'Live Updates' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchReservations}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateReservation}
          >
            New Reservation
          </Button>
        </Box>
      </Box>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Real-time updates are currently unavailable. Reservation status may not be up to date.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search (Reservation #, Guest Name, Room #)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="checked_in">Checked In</MenuItem>
                <MenuItem value="checked_out">Checked Out</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="no_show">No Show</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Reservation Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary">
                {reservations.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {reservations.filter((r) => r.status === 'confirmed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confirmed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {reservations.filter((r) => r.status === 'checked_in').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Checked In
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.secondary">
                {reservations.filter((r) => r.status === 'checked_out').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Checked Out
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {reservations.filter((r) => r.status === 'cancelled').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cancelled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reservations Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reservation #</TableCell>
                <TableCell>Guest</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Check-In</TableCell>
                <TableCell>Check-Out</TableCell>
                <TableCell>Nights</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReservations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((reservation) => {
                  const isRecentlyUpdated = recentlyUpdatedReservations.has(reservation._id);
                  
                  return (
                    <TableRow 
                      key={reservation._id} 
                      hover
                      sx={{
                        transition: 'background-color 0.3s ease',
                        backgroundColor: isRecentlyUpdated ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                        animation: isRecentlyUpdated ? 'highlight 1s ease-in-out' : 'none',
                        '@keyframes highlight': {
                          '0%': {
                            backgroundColor: 'rgba(25, 118, 210, 0.3)',
                          },
                          '100%': {
                            backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          },
                        },
                      }}
                    >
                    <TableCell>{reservation.reservationNumber}</TableCell>
                    <TableCell>
                      {reservation.guestDetails.primaryGuest.firstName}{' '}
                      {reservation.guestDetails.primaryGuest.lastName}
                    </TableCell>
                    <TableCell>
                      {reservation.roomDetails.roomNumber} ({reservation.roomDetails.roomType})
                    </TableCell>
                    <TableCell>{formatDate(reservation.dates.checkIn)}</TableCell>
                    <TableCell>{formatDate(reservation.dates.checkOut)}</TableCell>
                    <TableCell>{reservation.dates.nights}</TableCell>
                    <TableCell>{formatCurrency(reservation.pricing.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status.replace('_', ' ')}
                        color={getStatusColor(reservation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button size="small" onClick={() => handleOpenDetails(reservation)}>
                          Details
                        </Button>
                        {reservation.status === 'confirmed' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenAction(reservation, 'checkin')}
                          >
                            Check In
                          </Button>
                        )}
                        {reservation.status === 'checked_in' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleOpenAction(reservation, 'checkout')}
                          >
                            Check Out
                          </Button>
                        )}
                        {(reservation.status === 'confirmed' ||
                          reservation.status === 'checked_in') && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenAction(reservation, 'cancel')}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredReservations.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {filteredReservations.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No reservations found matching your filters
          </Typography>
        </Box>
      )}

      {/* Reservation Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedReservation && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Reservation {selectedReservation.reservationNumber}
                </Typography>
                <IconButton onClick={handleCloseDetails}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                {/* Status */}
                <Box>
                  <Chip
                    label={selectedReservation.status.replace('_', ' ')}
                    color={getStatusColor(selectedReservation.status)}
                  />
                </Box>

                <Divider />

                {/* Guest Information */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Guest Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.guestDetails.primaryGuest.firstName}{' '}
                        {selectedReservation.guestDetails.primaryGuest.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.guestDetails.primaryGuest.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.guestDetails.primaryGuest.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Guests
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.guestDetails.totalGuests} (
                        {selectedReservation.guestDetails.adults} adults,{' '}
                        {selectedReservation.guestDetails.children} children)
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Room Information */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <HotelIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Room Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Room Number
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.roomDetails.roomNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Room Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.roomDetails.roomType}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Daily Rate
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedReservation.roomDetails.dailyRate)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Stay Information */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Stay Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Check-In
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedReservation.dates.checkIn)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Check-Out
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedReservation.dates.checkOut)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Nights
                      </Typography>
                      <Typography variant="body1">{selectedReservation.dates.nights}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Source
                      </Typography>
                      <Typography variant="body1">{selectedReservation.source}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Payment Information */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Payment Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Room Charges
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedReservation.pricing.roomCharges)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Taxes
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedReservation.pricing.taxes)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fees
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedReservation.pricing.fees)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Discounts
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(selectedReservation.pricing.discounts)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(selectedReservation.pricing.totalAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Typography variant="body1">
                        {selectedReservation.payment.method.replace('_', ' ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Status
                      </Typography>
                      <Chip
                        label={selectedReservation.payment.status}
                        size="small"
                        color={
                          selectedReservation.payment.status === 'paid' ? 'success' : 'warning'
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Transactions */}
                {selectedReservation.payment.transactions.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Transactions
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Transaction ID</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Method</TableCell>
                              <TableCell>Date</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedReservation.payment.transactions.map((transaction) => (
                              <TableRow key={transaction.transactionId}>
                                <TableCell>{transaction.transactionId}</TableCell>
                                <TableCell>{transaction.type}</TableCell>
                                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                                <TableCell>{transaction.method.replace('_', ' ')}</TableCell>
                                <TableCell>{formatDate(transaction.processedAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Dialog (Check-in, Check-out, Cancel) */}
      <Dialog open={actionDialogOpen} onClose={handleCloseAction} maxWidth="sm" fullWidth>
        {selectedReservation && actionType && (
          <>
            <DialogTitle>
              {actionType === 'checkin' && 'Check In Guest'}
              {actionType === 'checkout' && 'Check Out Guest'}
              {actionType === 'cancel' && 'Cancel Reservation'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Reservation: <strong>{selectedReservation.reservationNumber}</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                Guest:{' '}
                <strong>
                  {selectedReservation.guestDetails.primaryGuest.firstName}{' '}
                  {selectedReservation.guestDetails.primaryGuest.lastName}
                </strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                Room: <strong>{selectedReservation.roomDetails.roomNumber}</strong>
              </Typography>

              {actionType === 'cancel' && (
                <TextField
                  fullWidth
                  label="Cancellation Reason"
                  multiline
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}

              <Alert severity="info" sx={{ mt: 2 }}>
                {actionType === 'checkin' &&
                  'This will mark the guest as checked in and update the room status.'}
                {actionType === 'checkout' &&
                  'This will mark the guest as checked out and make the room available for cleaning.'}
                {actionType === 'cancel' &&
                  'This will cancel the reservation and make the room available.'}
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseAction}>Cancel</Button>
              <Button
                onClick={handlePerformAction}
                variant="contained"
                color={actionType === 'cancel' ? 'error' : 'primary'}
                disabled={processingAction}
              >
                {processingAction ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    {actionType === 'checkin' && 'Check In'}
                    {actionType === 'checkout' && 'Check Out'}
                    {actionType === 'cancel' && 'Cancel Reservation'}
                  </>
                )}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Reservation Dialog */}
      <Dialog open={createReservationOpen} onClose={handleCloseCreateReservation} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Create New Reservation</Typography>
            <IconButton onClick={handleCloseCreateReservation}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Guest Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={guests}
                getOptionLabel={(option) =>
                  `${option.personalInfo.firstName} ${option.personalInfo.lastName} (${option.personalInfo.email})`
                }
                loading={loadingGuests}
                value={guests.find((g) => g._id === bookingForm.guestId) || null}
                onChange={(_, newValue) => handleBookingFormChange('guestId', newValue?._id || '')}
                renderInput={(params) => (
                  <TextField {...params} label="Select Guest" required />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Stay Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-In Date"
                type="date"
                value={bookingForm.checkIn}
                onChange={(e) => handleBookingFormChange('checkIn', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check-Out Date"
                type="date"
                value={bookingForm.checkOut}
                onChange={(e) => handleBookingFormChange('checkOut', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                inputProps={{ min: bookingForm.checkIn }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Adults"
                type="number"
                value={bookingForm.adults}
                onChange={(e) => handleBookingFormChange('adults', parseInt(e.target.value))}
                required
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Children"
                type="number"
                value={bookingForm.children}
                onChange={(e) => handleBookingFormChange('children', parseInt(e.target.value))}
                inputProps={{ min: 0, max: 10 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Room Selection
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {loadingRooms ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : availableRooms.length === 0 ? (
                <Alert severity="warning">
                  No rooms available for the selected dates. Please choose different dates.
                </Alert>
              ) : (
                <Autocomplete
                  options={availableRooms}
                  getOptionLabel={(option) =>
                    `Room ${option.roomNumber} - ${option.roomType.name} ($${option.roomType.basePrice}/night)`
                  }
                  value={availableRooms.find((r) => r._id === bookingForm.roomId) || null}
                  onChange={(_, newValue) => handleBookingFormChange('roomId', newValue?._id || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Room" required />
                  )}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Payment & Booking Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={bookingForm.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => handleBookingFormChange('paymentMethod', e.target.value)}
                >
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="debit_card">Debit Card</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="online_payment">Online Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Booking Source</InputLabel>
                <Select
                  value={bookingForm.source}
                  label="Booking Source"
                  onChange={(e) => handleBookingFormChange('source', e.target.value)}
                >
                  <MenuItem value="direct">Direct</MenuItem>
                  <MenuItem value="phone">Phone</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="website">Website</MenuItem>
                  <MenuItem value="booking_com">Booking.com</MenuItem>
                  <MenuItem value="expedia">Expedia</MenuItem>
                  <MenuItem value="airbnb">Airbnb</MenuItem>
                  <MenuItem value="walk_in">Walk-in</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                multiline
                rows={2}
                value={bookingForm.specialRequests}
                onChange={(e) => handleBookingFormChange('specialRequests', e.target.value)}
                placeholder="Any special requests or notes..."
              />
            </Grid>

            {bookingForm.guestId && bookingForm.roomId && (
              <>
                <Grid item xs={12}>
                  <Divider />
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Booking Summary
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    {(() => {
                      const details = calculateBookingDetails();
                      return (
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="body2">Nights:</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" align="right">
                              {details.nights}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Daily Rate:</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" align="right">
                              ${details.dailyRate.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Room Charges:</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" align="right">
                              ${details.roomCharges.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Taxes (10%):</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" align="right">
                              ${details.taxes.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Service Fees:</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" align="right">
                              ${details.fees.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="h6">Total Amount:</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="h6" align="right" color="primary">
                              ${details.totalAmount.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      );
                    })()}
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateReservation}>Cancel</Button>
          <Button
            onClick={handleCreateReservation}
            variant="contained"
            disabled={
              creatingReservation ||
              !bookingForm.guestId ||
              !bookingForm.roomId ||
              !bookingForm.checkIn ||
              !bookingForm.checkOut
            }
          >
            {creatingReservation ? <CircularProgress size={24} /> : 'Create Reservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

