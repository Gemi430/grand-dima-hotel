import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip,
  CircularProgress, Alert, Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as ConfirmIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Hotel as HotelIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';

interface BookingRequest {
  _id: string;
  guestName: string;
  phone: string;
  roomName: string;
  roomRate: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalAmount: number;
  specialRequests?: string;
  status: 'new' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  new:       { label: 'New',       color: '#2563eb', bg: '#eff6ff' },
  confirmed: { label: 'Confirmed', color: '#059669', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
  completed: { label: 'Completed', color: '#64748b', bg: '#f8fafc' },
};

const API = 'http://localhost:3001/api/public';

export const BookingRequestsPage: React.FC = () => {
  const { socket } = useSocket() as any;
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [staffNote, setStaffNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `${API}/booking-requests?status=${filterStatus}` : `${API}/booking-requests`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch { toast.error('Failed to load booking requests'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Real-time: new booking request arrives
  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      toast(`New booking request from ${data.guestName}!`, { icon: '🏨' });
      fetchRequests();
    };
    socket.on('booking_request:new', handler);
    return () => socket.off('booking_request:new', handler);
  }, [socket, fetchRequests]);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`${API}/booking-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
      });
      if (res.ok) {
        toast.success(`Request ${status}`);
        fetchRequests();
        setDetailOpen(false);
      }
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const openDetail = (req: BookingRequest) => {
    setSelected(req);
    setStaffNote(req.notes || '');
    setDetailOpen(true);
  };

  const counts = {
    new: requests.filter(r => r.status === 'new').length,
    confirmed: requests.filter(r => r.status === 'confirmed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Booking Requests</Typography>
          <Typography variant="body2" color="text.secondary">Guest room reservation inquiries from the website</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={fetchRequests} variant="outlined" size="small">Refresh</Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} mb={3}>
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          return (
            <Grid item xs={6} sm={3} key={status}>
              <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', '&:hover': { borderColor: cfg.color } }}
                onClick={() => setFilterStatus(filterStatus === status ? '' : status)}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: cfg.color }}>{count}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{cfg.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Filter */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select value={filterStatus} label="Filter by Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
              <MenuItem key={val} value={val}>{cfg.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {filterStatus && <Button size="small" onClick={() => setFilterStatus('')}>Clear filter</Button>}
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : requests.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>No booking requests found.</Alert>
      ) : (
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>GUEST</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>ROOM</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>DATES</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>TOTAL</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>RECEIVED</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status];
                  return (
                    <TableRow key={req._id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{req.guestName}</Typography>
                        <Typography variant="caption" color="text.secondary">{req.phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{req.roomName}</Typography>
                        <Typography variant="caption" color="text.secondary">ETB {req.roomRate.toLocaleString()}/night · {req.guests} guest{req.guests > 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(req.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} → {new Date(req.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                        <Typography variant="caption" color="text.secondary">{req.nights} night{req.nights > 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary.main">ETB {req.totalAmount.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.72rem', border: 'none' }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View details"><IconButton size="small" onClick={() => openDetail(req)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                          {req.status === 'new' && (
                            <>
                              <Tooltip title="Confirm"><IconButton size="small" color="success" onClick={() => updateStatus(req._id, 'confirmed')}><ConfirmIcon fontSize="small" /></IconButton></Tooltip>
                              <Tooltip title="Cancel"><IconButton size="small" color="error" onClick={() => updateStatus(req._id, 'cancelled')}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                            </>
                          )}
                          {req.status === 'confirmed' && (
                            <Tooltip title="Mark Completed"><IconButton size="small" onClick={() => updateStatus(req._id, 'completed')}><ConfirmIcon fontSize="small" color="action" /></IconButton></Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={700}>Booking Request Details</Typography>
                <Chip label={STATUS_CONFIG[selected.status].label} size="small"
                  sx={{ bgcolor: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color, fontWeight: 600 }} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Guest Name</Typography>
                      <Typography variant="body2" fontWeight={600}>{selected.guestName}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2" fontWeight={600}>{selected.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <HotelIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Room</Typography>
                      <Typography variant="body2" fontWeight={600}>{selected.roomName}</Typography>
                      <Typography variant="caption" color="text.secondary">ETB {selected.roomRate.toLocaleString()}/night · {selected.guests} guest{selected.guests > 1 ? 's' : ''}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center" mb={1}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Dates</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(selected.checkIn).toLocaleDateString()} → {new Date(selected.checkOut).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{selected.nights} night{selected.nights > 1 ? 's' : ''}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">ETB {selected.totalAmount.toLocaleString()}</Typography>
                  </Box>
                </Grid>
                {selected.specialRequests && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Special Requests</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: '#fffbeb', borderRadius: 1, border: '1px solid #fef3c7' }}>
                      {selected.specialRequests}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Staff Notes" value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="Add internal notes about this booking..."
                    size="small" />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
              <Button onClick={() => updateStatus(selected._id, selected.status, staffNote)} disabled={updating} variant="outlined">
                Save Notes
              </Button>
              {selected.status === 'new' && (
                <>
                  <Button onClick={() => updateStatus(selected._id, 'cancelled', staffNote)} color="error" disabled={updating}>Cancel</Button>
                  <Button onClick={() => updateStatus(selected._id, 'confirmed', staffNote)} variant="contained" color="success" disabled={updating}>
                    Confirm Booking
                  </Button>
                </>
              )}
              {selected.status === 'confirmed' && (
                <Button onClick={() => updateStatus(selected._id, 'completed', staffNote)} variant="contained" disabled={updating}>
                  Mark Completed
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
