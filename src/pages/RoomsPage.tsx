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
  Badge,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Hotel as HotelIcon,
  CheckCircle as CheckCircleIcon,
  Build as BuildIcon,
  CleaningServices as CleaningServicesIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import QRCode from 'qrcode';
import {
  useRoomStatusUpdates,
  useRoomAvailabilityUpdates,
  RoomStatusUpdate,
} from '../hooks/useRealtimeUpdates';
import { useSocket } from '../contexts/SocketContext';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import toast from 'react-hot-toast';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: {
    name: string;
    category: string;
    maxOccupancy: number;
    bedConfiguration: string;
    size: number;
    amenities: string[];
    basePrice: number;
    description?: string;
  };
  floor: number;
  status: string;
  features: {
    hasBalcony: boolean;
    hasKitchen: boolean;
    hasJacuzzi: boolean;
    oceanView: boolean;
    smokingAllowed: boolean;
    petFriendly: boolean;
  };
  housekeeping: {
    lastCleaned?: string;
    cleaningStatus: string;
    assignedTo?: string;
    notes?: string;
  };
  maintenance: {
    lastInspection?: string;
    issues: Array<{
      _id: string;
      description: string;
      severity: string;
      reportedBy: string;
      reportedAt: string;
      resolvedAt?: string;
      status: string;
    }>;
  };
  pricing: {
    baseRate: number;
    seasonalRates: Array<{
      season: string;
      startDate: string;
      endDate: string;
      rate: number;
    }>;
  };
  isActive: boolean;
}

export const RoomsPage: React.FC = () => {
  const { isConnected } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusChangeOpen, setStatusChangeOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [recentlyUpdatedRooms, setRecentlyUpdatedRooms] = useState<Set<string>>(new Set());
  const [showCalendar, setShowCalendar] = useState(false);
  const [createEditOpen, setCreateEditOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [selectedQrRoom, setSelectedQrRoom] = useState<Room | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeName: 'Standard',
    category: 'Standard',
    maxOccupancy: 2,
    bedConfiguration: '1 King Bed',
    size: 300,
    basePrice: 100,
    floor: 1,
    amenities: [] as string[],
    hasBalcony: false,
    hasKitchen: false,
    hasJacuzzi: false,
    oceanView: false,
    smokingAllowed: false,
    petFriendly: false,
    description: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/rooms?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || []);
      } else {
        toast.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Error fetching rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Apply filters
  useEffect(() => {
    let filtered = [...rooms];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((room) =>
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((room) => room.status === statusFilter);
    }

    // Room type filter
    if (roomTypeFilter !== 'all') {
      filtered = filtered.filter((room) => room.roomType.name === roomTypeFilter);
    }

    // Floor filter
    if (floorFilter !== 'all') {
      filtered = filtered.filter((room) => room.floor === parseInt(floorFilter));
    }

    setFilteredRooms(filtered);
  }, [rooms, searchQuery, statusFilter, roomTypeFilter, floorFilter]);

  // Subscribe to real-time room status updates
  const handleRoomStatusUpdate = useCallback((update: RoomStatusUpdate) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room._id === update.roomId || room.roomNumber === update.roomNumber
          ? { ...room, status: update.status }
          : room
      )
    );

    // Update selected room if it's the one that changed
    setSelectedRoom((prevSelected) =>
      prevSelected && (prevSelected._id === update.roomId || prevSelected.roomNumber === update.roomNumber)
        ? { ...prevSelected, status: update.status }
        : prevSelected
    );

    // Mark room as recently updated for visual indicator
    setRecentlyUpdatedRooms((prev) => {
      const updated = new Set(prev);
      updated.add(update.roomId);
      return updated;
    });

    // Remove the indicator after 3 seconds
    setTimeout(() => {
      setRecentlyUpdatedRooms((prev) => {
        const updated = new Set(prev);
        updated.delete(update.roomId);
        return updated;
      });
    }, 3000);
  }, []);

  useRoomStatusUpdates(handleRoomStatusUpdate, { showToast: true });

  // Subscribe to room availability changes
  const handleRoomAvailabilityUpdate = useCallback(
    (update: { roomId: string; available: boolean; timestamp: Date }) => {
      console.log('Room availability changed:', update);
      // Refresh rooms to get updated availability
      fetchRooms();
    },
    [fetchRooms]
  );

  useRoomAvailabilityUpdates(handleRoomAvailabilityUpdate);

  // Get status color
  const getStatusColor = (status: string): 'success' | 'primary' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'primary';
      case 'cleaning':
        return 'warning';
      case 'maintenance':
      case 'out_of_order':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon />;
      case 'occupied':
        return <HotelIcon />;
      case 'cleaning':
        return <CleaningServicesIcon />;
      case 'maintenance':
      case 'out_of_order':
        return <BuildIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Open room details
  const handleOpenDetails = (room: Room) => {
    setSelectedRoom(room);
    setDetailsOpen(true);
  };

  // Close room details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedRoom(null);
  };

  // Open status change dialog
  const handleOpenStatusChange = (room: Room) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setStatusChangeOpen(true);
  };

  // Close status change dialog
  const handleCloseStatusChange = () => {
    setStatusChangeOpen(false);
    setSelectedRoom(null);
    setNewStatus('');
  };

  // Update room status
  const handleUpdateStatus = async () => {
    if (!selectedRoom || !newStatus) return;

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/rooms/${selectedRoom._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Room ${selectedRoom.roomNumber} status updated to ${newStatus}`);
        handleCloseStatusChange();
        // The real-time update will handle the UI update
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update room status');
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Error updating room status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Get unique floors
  const uniqueFloors = Array.from(new Set(rooms.map((room) => room.floor))).sort((a, b) => a - b);

  // Get unique room types
  const uniqueRoomTypes = Array.from(new Set(rooms.map((room) => room.roomType.name)));

  // Handle open create/edit dialog
  const handleOpenCreateEdit = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        roomNumber: room.roomNumber,
        roomTypeName: room.roomType.name,
        category: room.roomType.category,
        maxOccupancy: room.roomType.maxOccupancy,
        bedConfiguration: room.roomType.bedConfiguration,
        size: room.roomType.size,
        basePrice: room.roomType.basePrice,
        floor: room.floor,
        amenities: room.roomType.amenities || [],
        hasBalcony: room.features.hasBalcony,
        hasKitchen: room.features.hasKitchen,
        hasJacuzzi: room.features.hasJacuzzi,
        oceanView: room.features.oceanView,
        smokingAllowed: room.features.smokingAllowed,
        petFriendly: room.features.petFriendly,
        description: room.roomType.description || '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        roomNumber: '',
        roomTypeName: 'Standard',
        category: 'Standard',
        maxOccupancy: 2,
        bedConfiguration: '1 King Bed',
        size: 300,
        basePrice: 100,
        floor: 1,
        amenities: [],
        hasBalcony: false,
        hasKitchen: false,
        hasJacuzzi: false,
        oceanView: false,
        smokingAllowed: false,
        petFriendly: false,
        description: '',
      });
    }
    setCreateEditOpen(true);
  };

  // Handle close create/edit dialog
  const handleCloseCreateEdit = () => {
    setCreateEditOpen(false);
    setEditingRoom(null);
  };

  // Handle form input change
  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle amenity toggle
  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  // Handle save room (create or update)
  const handleSaveRoom = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const payload = {
        roomNumber: formData.roomNumber,
        roomType: {
          name: formData.roomTypeName,
          category: formData.category,
          maxOccupancy: formData.maxOccupancy,
          bedConfiguration: formData.bedConfiguration,
          size: formData.size,
          amenities: formData.amenities,
          basePrice: formData.basePrice,
          description: formData.description || undefined,
        },
        floor: formData.floor,
        features: {
          hasBalcony: formData.hasBalcony,
          hasKitchen: formData.hasKitchen,
          hasJacuzzi: formData.hasJacuzzi,
          oceanView: formData.oceanView,
          smokingAllowed: formData.smokingAllowed,
          petFriendly: formData.petFriendly,
        },
        pricing: {
          baseRate: formData.basePrice,
          seasonalRates: [],
        },
      };

      const url = editingRoom
        ? `http://localhost:3001/api/rooms/${editingRoom._id}`
        : 'http://localhost:3001/api/rooms';

      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(editingRoom ? 'Room updated successfully' : 'Room created successfully');
        
        // If creating a new room, generate and show QR code
        if (!editingRoom && result.data?.room) {
          await generateQRCode(result.data.room);
        }
        
        handleCloseCreateEdit();
        fetchRooms();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save room');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Error saving room');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete room
  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete room ${roomNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`Room ${roomNumber} deleted successfully`);
        fetchRooms();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Error deleting room');
    }
  };

  // Generate QR code for room
  const generateQRCode = async (room: Room) => {
    try {
      const qrData = JSON.stringify({
        roomId: room._id,
        roomNumber: room.roomNumber,
        roomType: room.roomType.name,
        floor: room.floor,
        hotelName: 'Hotel Management System',
      });

      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      setQrCodeDataUrl(qrCodeUrl);
      setSelectedQrRoom(room);
      setQrCodeDialogOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  // Handle download QR code
  const handleDownloadQRCode = () => {
    if (!qrCodeDataUrl || !selectedQrRoom) return;

    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `room-${selectedQrRoom.roomNumber}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  // Handle close QR code dialog
  const handleCloseQRCode = () => {
    setQrCodeDialogOpen(false);
    setSelectedQrRoom(null);
    setQrCodeDataUrl('');
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
          Room Management
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
            label={isConnected ? 'Live Updates' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
          <Button
            variant={showCalendar ? 'contained' : 'outlined'}
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRooms}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCreateEdit()}
          >
            Add Room
          </Button>
        </Box>
      </Box>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Real-time updates are currently unavailable. Room status may not be up to date.
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Room Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="cleaning">Cleaning</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out_of_order">Out of Order</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={roomTypeFilter}
                label="Room Type"
                onChange={(e) => setRoomTypeFilter(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {uniqueRoomTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Floor</InputLabel>
              <Select
                value={floorFilter}
                label="Floor"
                onChange={(e) => setFloorFilter(e.target.value)}
              >
                <MenuItem value="all">All Floors</MenuItem>
                {uniqueFloors.map((floor) => (
                  <MenuItem key={floor} value={floor.toString()}>
                    Floor {floor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Room Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="text.primary">
                {rooms.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Rooms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {rooms.filter((r) => r.status === 'available').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {rooms.filter((r) => r.status === 'occupied').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {rooms.filter((r) => r.status === 'cleaning').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cleaning
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {rooms.filter((r) => r.status === 'maintenance').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maintenance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {rooms.filter((r) => r.status === 'out_of_order').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Out of Order
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Availability Calendar */}
      {showCalendar && (
        <Box mb={3}>
          <AvailabilityCalendar />
        </Box>
      )}

      {/* Room Grid */}
      <Grid container spacing={2}>
        {filteredRooms.map((room) => {
          const isRecentlyUpdated = recentlyUpdatedRooms.has(room._id);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={room._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s, border 0.3s',
                  border: isRecentlyUpdated ? '2px solid #1976d2' : '1px solid transparent',
                  animation: isRecentlyUpdated ? 'pulse 1s ease-in-out' : 'none',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                    },
                    '70%': {
                      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)',
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
                    },
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" component="div">
                    {room.roomNumber}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(room.status)}
                    label={room.status.replace('_', ' ')}
                    color={getStatusColor(room.status)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {room.roomType.name} - Floor {room.floor}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {room.roomType.bedConfiguration}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Max: {room.roomType.maxOccupancy} guests
                </Typography>
                <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                  ${room.pricing.baseRate}/night
                </Typography>
                {room.maintenance.issues.filter((i) => i.status === 'open').length > 0 && (
                  <Badge
                    badgeContent={room.maintenance.issues.filter((i) => i.status === 'open').length}
                    color="error"
                    sx={{ mt: 1 }}
                  >
                    <Chip label="Maintenance Issues" size="small" color="error" variant="outlined" />
                  </Badge>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleOpenDetails(room)}>
                  Details
                </Button>
                <Button size="small" onClick={() => handleOpenStatusChange(room)}>
                  Change Status
                </Button>
                <IconButton size="small" onClick={() => handleOpenCreateEdit(room)} title="Edit Room">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => generateQRCode(room)} title="Generate QR Code" color="primary">
                  <QrCodeIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteRoom(room._id, room.roomNumber)} 
                  title="Delete Room"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        );
        })}
      </Grid>

      {filteredRooms.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No rooms found matching your filters
          </Typography>
        </Box>
      )}

      {/* Room Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedRoom && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Room {selectedRoom.roomNumber} Details</Typography>
                <IconButton onClick={handleCloseDetails}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                {/* Basic Info */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Room Type
                      </Typography>
                      <Typography variant="body1">{selectedRoom.roomType.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        icon={getStatusIcon(selectedRoom.status)}
                        label={selectedRoom.status.replace('_', ' ')}
                        color={getStatusColor(selectedRoom.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Floor
                      </Typography>
                      <Typography variant="body1">{selectedRoom.floor}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Max Occupancy
                      </Typography>
                      <Typography variant="body1">{selectedRoom.roomType.maxOccupancy}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bed Configuration
                      </Typography>
                      <Typography variant="body1">{selectedRoom.roomType.bedConfiguration}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Size
                      </Typography>
                      <Typography variant="body1">{selectedRoom.roomType.size} sq ft</Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Divider />

                {/* Features */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Features
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedRoom.features.hasBalcony && <Chip label="Balcony" size="small" />}
                    {selectedRoom.features.hasKitchen && <Chip label="Kitchen" size="small" />}
                    {selectedRoom.features.hasJacuzzi && <Chip label="Jacuzzi" size="small" />}
                    {selectedRoom.features.oceanView && <Chip label="Ocean View" size="small" />}
                    {selectedRoom.features.smokingAllowed && <Chip label="Smoking Allowed" size="small" />}
                    {selectedRoom.features.petFriendly && <Chip label="Pet Friendly" size="small" />}
                  </Box>
                </Box>

                <Divider />

                {/* Amenities */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Amenities
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedRoom.roomType.amenities.map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                <Divider />

                {/* Pricing */}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Pricing
                  </Typography>
                  <Typography variant="body1">
                    Base Rate: <strong>${selectedRoom.pricing.baseRate}/night</strong>
                  </Typography>
                  {selectedRoom.pricing.seasonalRates.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Seasonal Rates:
                      </Typography>
                      {selectedRoom.pricing.seasonalRates.map((rate, index) => (
                        <Typography key={index} variant="body2">
                          {rate.season}: ${rate.rate}/night
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Maintenance Issues */}
                {selectedRoom.maintenance.issues.length > 0 && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Maintenance Issues
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell>Severity</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Reported</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedRoom.maintenance.issues.map((issue) => (
                              <TableRow key={issue._id}>
                                <TableCell>{issue.description}</TableCell>
                                <TableCell>
                                  <Chip label={issue.severity} size="small" color="warning" />
                                </TableCell>
                                <TableCell>
                                  <Chip label={issue.status} size="small" />
                                </TableCell>
                                <TableCell>
                                  {new Date(issue.reportedAt).toLocaleDateString()}
                                </TableCell>
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

      {/* Status Change Dialog */}
      <Dialog open={statusChangeOpen} onClose={handleCloseStatusChange} maxWidth="sm" fullWidth>
        {selectedRoom && (
          <>
            <DialogTitle>Change Room Status - {selectedRoom.roomNumber}</DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  label="New Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="out_of_order">Out of Order</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseStatusChange}>Cancel</Button>
              <Button
                onClick={handleUpdateStatus}
                variant="contained"
                disabled={updatingStatus || newStatus === selectedRoom.status}
              >
                {updatingStatus ? <CircularProgress size={24} /> : 'Update Status'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create/Edit Room Dialog */}
      <Dialog open={createEditOpen} onClose={handleCloseCreateEdit} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{editingRoom ? 'Edit Room' : 'Create New Room'}</Typography>
            <IconButton onClick={handleCloseCreateEdit}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Room Number"
                value={formData.roomNumber}
                onChange={(e) => handleFormChange('roomNumber', e.target.value.toUpperCase())}
                required
                disabled={!!editingRoom}
                helperText="Alphanumeric, max 10 characters"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Room Type</InputLabel>
                <Select
                  value={formData.roomTypeName}
                  label="Room Type"
                  onChange={(e) => handleFormChange('roomTypeName', e.target.value)}
                >
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Deluxe">Deluxe</MenuItem>
                  <MenuItem value="Suite">Suite</MenuItem>
                  <MenuItem value="Executive">Executive</MenuItem>
                  <MenuItem value="Presidential">Presidential</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor"
                type="number"
                value={formData.floor}
                onChange={(e) => handleFormChange('floor', parseInt(e.target.value))}
                required
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Occupancy"
                type="number"
                value={formData.maxOccupancy}
                onChange={(e) => handleFormChange('maxOccupancy', parseInt(e.target.value))}
                required
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bed Configuration"
                value={formData.bedConfiguration}
                onChange={(e) => handleFormChange('bedConfiguration', e.target.value)}
                required
                placeholder="e.g., 1 King Bed, 2 Queen Beds"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Size (sq ft)"
                type="number"
                value={formData.size}
                onChange={(e) => handleFormChange('size', parseFloat(e.target.value))}
                required
                inputProps={{ min: 10, max: 5000 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price (per night)"
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleFormChange('basePrice', parseFloat(e.target.value))}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Features
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasBalcony}
                      onChange={(e) => handleFormChange('hasBalcony', e.target.checked)}
                    />
                  }
                  label="Balcony"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasKitchen}
                      onChange={(e) => handleFormChange('hasKitchen', e.target.checked)}
                    />
                  }
                  label="Kitchen"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.hasJacuzzi}
                      onChange={(e) => handleFormChange('hasJacuzzi', e.target.checked)}
                    />
                  }
                  label="Jacuzzi"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.oceanView}
                      onChange={(e) => handleFormChange('oceanView', e.target.checked)}
                    />
                  }
                  label="Ocean View"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.smokingAllowed}
                      onChange={(e) => handleFormChange('smokingAllowed', e.target.checked)}
                    />
                  }
                  label="Smoking Allowed"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.petFriendly}
                      onChange={(e) => handleFormChange('petFriendly', e.target.checked)}
                    />
                  }
                  label="Pet Friendly"
                />
              </FormGroup>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Amenities
              </Typography>
              <FormGroup row>
                {['WiFi', 'TV', 'Mini Bar', 'Safe', 'Air Conditioning', 'Heating', 'Coffee Maker', 'Hair Dryer', 'Iron', 'Room Service'].map((amenity) => (
                  <FormControlLabel
                    key={amenity}
                    control={
                      <Checkbox
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                      />
                    }
                    label={amenity}
                  />
                ))}
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateEdit}>Cancel</Button>
          <Button
            onClick={handleSaveRoom}
            variant="contained"
            disabled={saving || !formData.roomNumber || !formData.roomTypeName}
          >
            {saving ? <CircularProgress size={24} /> : editingRoom ? 'Update Room' : 'Create Room'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onClose={handleCloseQRCode} maxWidth="sm" fullWidth>
        {selectedQrRoom && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">QR Code - Room {selectedQrRoom.roomNumber}</Typography>
                <IconButton onClick={handleCloseQRCode}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                {qrCodeDataUrl && (
                  <img src={qrCodeDataUrl} alt={`QR Code for Room ${selectedQrRoom.roomNumber}`} style={{ width: '100%', maxWidth: 300 }} />
                )}
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Scan this QR code to access room information
                </Typography>
                <Box>
                  <Typography variant="body2">
                    <strong>Room:</strong> {selectedQrRoom.roomNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {selectedQrRoom.roomType.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Floor:</strong> {selectedQrRoom.floor}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseQRCode}>Close</Button>
              <Button onClick={handleDownloadQRCode} variant="contained" startIcon={<QrCodeIcon />}>
                Download QR Code
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
