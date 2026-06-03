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
  Restaurant as FoodIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useSocket } from '../contexts/SocketContext';

interface FoodOrder {
  _id: string;
  guestName: string;
  phone: string;
  itemName: string;
  itemNameAm?: string;
  itemPrice: number;
  category: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
  status: 'new' | 'confirmed' | 'preparing' | 'served' | 'cancelled';
  staffNotes?: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  new:       { label: 'New',       color: '#2563eb', bg: '#eff6ff' },
  confirmed: { label: 'Confirmed', color: '#0891b2', bg: '#ecfeff' },
  preparing: { label: 'Preparing', color: '#d97706', bg: '#fffbeb' },
  served:    { label: 'Served',    color: '#059669', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
};

const NEXT_STATUS: Record<string, string> = {
  new: 'confirmed',
  confirmed: 'preparing',
  preparing: 'served',
};

const API = 'http://localhost:3001/api/public';

export const FoodOrdersPage: React.FC = () => {
  const { socket } = useSocket() as any;
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<FoodOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [staffNote, setStaffNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const url = filterStatus ? `${API}/food-orders?status=${filterStatus}` : `${API}/food-orders`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch { toast.error('Failed to load food orders'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Real-time: new food order arrives
  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      toast(`New table reservation from ${data.guestName} for ${data.itemName}!`, { icon: '🍽️' });
      fetchOrders();
    };
    socket.on('food_order:new', handler);
    return () => socket.off('food_order:new', handler);
  }, [socket, fetchOrders]);

  const updateStatus = async (id: string, status: string, staffNotes?: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`${API}/food-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ status, ...(staffNotes !== undefined && { staffNotes }) }),
      });
      if (res.ok) {
        toast.success(`Order updated to ${status}`);
        fetchOrders();
        setDetailOpen(false);
      }
    } catch { toast.error('Update failed'); }
    finally { setUpdating(false); }
  };

  const openDetail = (order: FoodOrder) => {
    setSelected(order);
    setStaffNote(order.staffNotes || '');
    setDetailOpen(true);
  };

  const counts = {
    new: orders.filter(o => o.status === 'new').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    served: orders.filter(o => o.status === 'served').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Food & Table Orders</Typography>
          <Typography variant="body2" color="text.secondary">Table reservations and dining requests from the website</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={fetchOrders} variant="outlined" size="small">Refresh</Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} mb={3}>
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
          return (
            <Grid item xs={6} sm={4} md={2.4} key={status}>
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
      ) : orders.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>No food orders found.</Alert>
      ) : (
        <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>GUEST</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>ITEM</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>DATE & TIME</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>GUESTS</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>PRICE</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#475569' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  const next = NEXT_STATUS[order.status];
                  return (
                    <TableRow key={order._id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{order.guestName}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.phone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{order.itemName}</Typography>
                        {order.itemNameAm && <Typography variant="caption" color="text.secondary">{order.itemNameAm}</Typography>}
                        <Typography variant="caption" color="text.secondary" display="block">{order.category}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.guests} guest{order.guests > 1 ? 's' : ''}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary.main">ETB {order.itemPrice}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.72rem', border: 'none' }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View details"><IconButton size="small" onClick={() => openDetail(order)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                          {next && (
                            <Tooltip title={`Move to ${next}`}>
                              <IconButton size="small" color="success" onClick={() => updateStatus(order._id, next)}>
                                <ConfirmIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'served' && (
                            <Tooltip title="Cancel"><IconButton size="small" color="error" onClick={() => updateStatus(order._id, 'cancelled')}><CancelIcon fontSize="small" /></IconButton></Tooltip>
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
                <Typography variant="h6" fontWeight={700}>Order Details</Typography>
                <Chip label={STATUS_CONFIG[selected.status].label} size="small"
                  sx={{ bgcolor: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color, fontWeight: 600 }} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Guest</Typography>
                      <Typography variant="body2" fontWeight={600}>{selected.guestName}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center">
                    <PhoneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2" fontWeight={600}>{selected.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center">
                    <FoodIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Item</Typography>
                      <Typography variant="body2" fontWeight={600}>{selected.itemName}</Typography>
                      {selected.itemNameAm && <Typography variant="caption" color="text.secondary">{selected.itemNameAm}</Typography>}
                      <Typography variant="caption" color="text.secondary" display="block">{selected.category} · ETB {selected.itemPrice}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" gap={1} alignItems="center">
                    <TimeIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(selected.date).toLocaleDateString()} at {selected.time}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{selected.guests} guest{selected.guests > 1 ? 's' : ''}</Typography>
                    </Box>
                  </Box>
                </Grid>
                {selected.notes && (
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">Guest Notes</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, p: 1.5, bgcolor: '#fffbeb', borderRadius: 1, border: '1px solid #fef3c7' }}>
                      {selected.notes}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Staff Notes" value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="Add kitchen or service notes..."
                    size="small" />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setDetailOpen(false)}>Close</Button>
              <Button onClick={() => updateStatus(selected._id, selected.status, staffNote)} disabled={updating} variant="outlined">
                Save Notes
              </Button>
              {NEXT_STATUS[selected.status] && (
                <Button onClick={() => updateStatus(selected._id, NEXT_STATUS[selected.status], staffNote)} variant="contained" color="success" disabled={updating}>
                  Move to {NEXT_STATUS[selected.status]}
                </Button>
              )}
              {selected.status !== 'cancelled' && selected.status !== 'served' && (
                <Button onClick={() => updateStatus(selected._id, 'cancelled', staffNote)} color="error" disabled={updating}>Cancel</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
