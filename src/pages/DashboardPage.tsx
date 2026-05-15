import React, { useState, useCallback, useEffect } from 'react';
import {
  Typography, Box, Grid, Card, CardContent, Alert, Chip,
  CircularProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, LinearProgress, Avatar, Divider,
  IconButton, Tooltip, Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Hotel as HotelIcon,
  AttachMoney as MoneyIcon,
  CleaningServices as CleaningIcon,
  TrendingUp as TrendingUpIcon,
  FlightLand as ArrivalIcon,
  FlightTakeoff as DepartureIcon,
  Build as MaintenanceIcon,
  OpenInNew as OpenInNewIcon,
  EventNote as BookingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  useDashboardMetrics,
  useDashboardAlerts,
  useReservationUpdates,
  useRoomStatusUpdates,
  DashboardMetrics,
  Notification,
  ReservationUpdate,
  RoomStatusUpdate,
} from '../hooks/useRealtimeUpdates';
import { useSocket } from '../contexts/SocketContext';

interface RevenueBreakdown {
  roomCharges: number;
  serviceCharges: number;
  taxes: number;
  total: number;
}

interface UpcomingArrival {
  reservationNumber: string;
  guestName: string;
  roomNumber: string;
  checkInTime: Date;
  status: string;
}

interface UpcomingDeparture {
  reservationNumber: string;
  guestName: string;
  roomNumber: string;
  checkOutTime: Date;
  status: string;
}

// Stat card with icon, color, value, label, and optional progress bar
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  subtitle?: string;
  progress?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bgColor, subtitle, progress, onClick }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'grey.100',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'all 0.25s ease',
      '&:hover': onClick ? {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${color}22`,
        borderColor: color,
      } : {},
    }}
  >
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="text.primary" lineHeight={1}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            bgcolor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '& .MuiSvgIcon-root': { fontSize: 26, color },
          }}
        >
          {icon}
        </Box>
      </Box>
      {progress !== undefined && (
        <Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: bgColor,
              '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
            }}
          />
          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
            {progress}% occupancy
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Notification[]>([]);
  const [recentReservations, setRecentReservations] = useState<ReservationUpdate[]>([]);
  const [recentRoomUpdates, setRecentRoomUpdates] = useState<RoomStatusUpdate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [upcomingArrivals, setUpcomingArrivals] = useState<UpcomingArrival[]>([]);
  const [upcomingDepartures, setUpcomingDepartures] = useState<UpcomingDeparture[]>([]);
  const [nextUpdateIn, setNextUpdateIn] = useState(30);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [metricsRes, revenueRes, arrivalsRes, departuresRes] = await Promise.allSettled([
          fetch('http://localhost:3001/api/dashboard/metrics', { headers }),
          fetch('http://localhost:3001/api/dashboard/revenue-breakdown', { headers }),
          fetch('http://localhost:3001/api/dashboard/upcoming-arrivals', { headers }),
          fetch('http://localhost:3001/api/dashboard/upcoming-departures', { headers }),
        ]);

        if (metricsRes.status === 'fulfilled' && metricsRes.value.ok) {
          const d = await metricsRes.value.json();
          setMetrics(d.data);
          setLastUpdate(new Date());
        }
        if (revenueRes.status === 'fulfilled' && revenueRes.value.ok) {
          const d = await revenueRes.value.json();
          setRevenueBreakdown(d.data);
        }
        if (arrivalsRes.status === 'fulfilled' && arrivalsRes.value.ok) {
          const d = await arrivalsRes.value.json();
          setUpcomingArrivals(d.data || []);
        }
        if (departuresRes.status === 'fulfilled' && departuresRes.value.ok) {
          const d = await departuresRes.value.json();
          setUpcomingDepartures(d.data || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleMetricsUpdate = useCallback((newMetrics: DashboardMetrics) => {
    setMetrics(newMetrics);
    setLastUpdate(new Date());
    setNextUpdateIn(30);
  }, []);
  useDashboardMetrics(handleMetricsUpdate);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        setNextUpdateIn((prev) => (prev <= 1 ? 30 : prev - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleAlert = useCallback((alert: Notification) => {
    setRecentAlerts((prev) => [alert, ...prev].slice(0, 5));
  }, []);
  useDashboardAlerts(handleAlert, { showToast: true });

  const handleReservationUpdate = useCallback((update: ReservationUpdate) => {
    setRecentReservations((prev) => [update, ...prev].slice(0, 8));
  }, []);
  useReservationUpdates(handleReservationUpdate, { showToast: false });

  const handleRoomStatusUpdate = useCallback((update: RoomStatusUpdate) => {
    setRecentRoomUpdates((prev) => [update, ...prev].slice(0, 8));
  }, []);
  useRoomStatusUpdates(handleRoomStatusUpdate, { showToast: false });

  const getTimeSinceUpdate = () => {
    if (!lastUpdate) return 'Never';
    const s = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`;
  };

  const formatTime = (date: Date | string) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getStatusColor = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
      confirmed: 'info',
      checked_in: 'success',
      checked_out: 'default',
      cancelled: 'error',
      pending: 'warning',
      available: 'success',
      occupied: 'error',
      cleaning: 'warning',
      maintenance: 'error',
    };
    return map[status] || 'default';
  };

  const getStatusBg = (status: string) => {
    const map: Record<string, string> = {
      confirmed: '#eff6ff',
      checked_in: '#f0fdf4',
      checked_out: '#f8fafc',
      cancelled: '#fef2f2',
      pending: '#fffbeb',
      available: '#f0fdf4',
      occupied: '#fef2f2',
      cleaning: '#fffbeb',
      maintenance: '#fef2f2',
    };
    return map[status] || '#f8fafc';
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
        <CircularProgress size={48} thickness={4} />
        <Typography color="text.secondary">Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>

      {/* Page Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening today.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {!isConnected && (
            <Chip
              icon={<ErrorIcon />}
              label="Offline"
              color="error"
              size="small"
              variant="outlined"
            />
          )}
          {lastUpdate && (
            <Chip
              icon={<RefreshIcon />}
              label={`Updated ${getTimeSinceUpdate()}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'grey.300', color: 'text.secondary' }}
            />
          )}
          {isConnected && (
            <Chip
              icon={<CheckCircleIcon />}
              label={`Live · ${nextUpdateIn}s`}
              size="small"
              sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#059669', border: 'none', fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Real-time updates unavailable. Data may not reflect the latest changes.
        </Alert>
      )}

      {/* Primary Stats Row */}
      {metrics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              label="Total Rooms"
              value={metrics.occupancy.total}
              icon={<HotelIcon />}
              color="#2563eb"
              bgColor="#eff6ff"
              subtitle="All room inventory"
              onClick={() => navigate('/rooms')}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              label="Available"
              value={metrics.occupancy.available}
              icon={<CheckCircleIcon />}
              color="#059669"
              bgColor="#f0fdf4"
              subtitle="Ready to book"
              progress={metrics.occupancy.total > 0 ? Math.round((metrics.occupancy.available / metrics.occupancy.total) * 100) : 0}
              onClick={() => navigate('/rooms')}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              label="Occupied"
              value={metrics.occupancy.occupied}
              icon={<TrendingUpIcon />}
              color="#dc2626"
              bgColor="#fef2f2"
              subtitle={`${metrics.occupancy.occupancyRate}% occupancy rate`}
              progress={Number(metrics.occupancy.occupancyRate)}
              onClick={() => navigate('/reservations')}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              label="Today's Revenue"
              value={`$${metrics.revenue.today.toLocaleString()}`}
              icon={<MoneyIcon />}
              color="#7c3aed"
              bgColor="#f5f3ff"
              subtitle="All transactions today"
              onClick={() => navigate('/billing')}
            />
          </Grid>
        </Grid>
      )}

      {/* Secondary Stats Row */}
      {metrics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Today's Arrivals"
              value={metrics.reservations.arrivals}
              icon={<ArrivalIcon />}
              color="#0891b2"
              bgColor="#ecfeff"
              subtitle="Expected check-ins"
              onClick={() => navigate('/reservations')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Today's Departures"
              value={metrics.reservations.departures}
              icon={<DepartureIcon />}
              color="#d97706"
              bgColor="#fffbeb"
              subtitle="Expected check-outs"
              onClick={() => navigate('/reservations')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Maintenance"
              value={metrics.occupancy.maintenance}
              icon={<MaintenanceIcon />}
              color="#b45309"
              bgColor="#fef3c7"
              subtitle="Rooms under maintenance"
              onClick={() => navigate('/rooms')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Housekeeping"
              value={metrics.housekeeping.pendingTasks}
              icon={<CleaningIcon />}
              color="#0d9488"
              bgColor="#f0fdfa"
              subtitle="Pending tasks"
              onClick={() => navigate('/housekeeping')}
            />
          </Grid>
        </Grid>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>

        {/* Revenue Breakdown */}
        {revenueBreakdown && (
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Typography variant="subtitle1" fontWeight={700}>Revenue Breakdown</Typography>
                  <Chip label="Today" size="small" sx={{ bgcolor: '#f0fdf4', color: '#059669', fontWeight: 600, fontSize: '0.7rem' }} />
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  {[
                    { label: 'Room Charges', value: revenueBreakdown.roomCharges, color: '#2563eb', pct: revenueBreakdown.total > 0 ? (revenueBreakdown.roomCharges / revenueBreakdown.total) * 100 : 0 },
                    { label: 'Service Charges', value: revenueBreakdown.serviceCharges, color: '#7c3aed', pct: revenueBreakdown.total > 0 ? (revenueBreakdown.serviceCharges / revenueBreakdown.total) * 100 : 0 },
                    { label: 'Taxes', value: revenueBreakdown.taxes, color: '#d97706', pct: revenueBreakdown.total > 0 ? (revenueBreakdown.taxes / revenueBreakdown.total) * 100 : 0 },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={600}>${item.value.toLocaleString()}</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={item.pct}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 3 } }}
                      />
                    </Box>
                  ))}
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      ${revenueBreakdown.total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Upcoming Arrivals */}
        <Grid item xs={12} md={revenueBreakdown ? 4 : 6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrivalIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>Arrivals Today</Typography>
                </Box>
                <Tooltip title="View all reservations">
                  <IconButton size="small" onClick={() => navigate('/reservations')} sx={{ color: 'text.secondary' }}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              {upcomingArrivals.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ArrivalIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No arrivals today</Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {upcomingArrivals.slice(0, 5).map((arrival) => (
                    <Box
                      key={arrival.reservationNumber}
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', transition: 'all 0.2s', '&:hover': { bgcolor: '#eff6ff' } }}
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#dbeafe', color: '#2563eb', fontSize: '0.8rem', fontWeight: 700 }}>
                        {arrival.guestName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Box flexGrow={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>{arrival.guestName}</Typography>
                        <Typography variant="caption" color="text.secondary">Room {arrival.roomNumber} · {formatTime(arrival.checkInTime)}</Typography>
                      </Box>
                      <Chip
                        label={arrival.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(arrival.status)}
                        sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Departures */}
        <Grid item xs={12} md={revenueBreakdown ? 4 : 6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DepartureIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>Departures Today</Typography>
                </Box>
                <Tooltip title="View all reservations">
                  <IconButton size="small" onClick={() => navigate('/reservations')} sx={{ color: 'text.secondary' }}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              {upcomingDepartures.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <DepartureIcon sx={{ fontSize: 40, color: 'grey.300', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No departures today</Typography>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {upcomingDepartures.slice(0, 5).map((dep) => (
                    <Box
                      key={dep.reservationNumber}
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8fafc', transition: 'all 0.2s', '&:hover': { bgcolor: '#fffbeb' } }}
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#fef3c7', color: '#d97706', fontSize: '0.8rem', fontWeight: 700 }}>
                        {dep.guestName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Box flexGrow={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>{dep.guestName}</Typography>
                        <Typography variant="caption" color="text.secondary">Room {dep.roomNumber} · {formatTime(dep.checkOutTime)}</Typography>
                      </Box>
                      <Chip
                        label={dep.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(dep.status)}
                        sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Reservation Updates (live) */}
        {recentReservations.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookingIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>Live Booking Updates</Typography>
                  </Box>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s infinite' }} />
                </Box>
                <Box display="flex" flexDirection="column" gap={1}>
                  {recentReservations.map((res, i) => (
                    <Box
                      key={`${res.reservationId}-${i}`}
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: getStatusBg(res.status), border: '1px solid', borderColor: 'grey.100' }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: '#ede9fe', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700 }}>
                        {res.guestName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                      </Avatar>
                      <Box flexGrow={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>{res.guestName}</Typography>
                        <Typography variant="caption" color="text.secondary">Room {res.roomNumber} · #{res.reservationNumber}</Typography>
                      </Box>
                      <Chip
                        label={res.status.replace('_', ' ')}
                        size="small"
                        color={getStatusColor(res.status)}
                        sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Room Status Updates (live) */}
        {recentRoomUpdates.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HotelIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>Room Status Updates</Typography>
                  </Box>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulse 2s infinite' }} />
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1.5}>
                  {recentRoomUpdates.map((update, i) => {
                    const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
                      available: { bg: '#f0fdf4', text: '#059669', dot: '#10b981' },
                      occupied: { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
                      cleaning: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
                      maintenance: { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
                    };
                    const sc = statusColors[update.status] || { bg: '#f8fafc', text: '#64748b', dot: '#94a3b8' };
                    return (
                      <Box
                        key={`${update.roomId}-${i}`}
                        sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: sc.bg, border: '1px solid', borderColor: 'grey.100', minWidth: 120 }}
                      >
                        <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sc.dot }} />
                          <Typography variant="body2" fontWeight={700} color={sc.text}>
                            Room {update.roomNumber}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {update.status}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Alerts */}
        {recentAlerts.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.100', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  System Alerts
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {recentAlerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={alert.type as any}
                      sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{alert.title}</Typography>
                          <Typography variant="caption">{alert.message}</Typography>
                        </Box>
                      </Box>
                    </Alert>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Empty state */}
        {!metrics && isConnected && (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'grey.300' }}>
              <CircularProgress size={32} sx={{ mb: 2 }} />
              <Typography color="text.secondary">Loading real-time metrics...</Typography>
            </Paper>
          </Grid>
        )}

      </Grid>
    </Box>
  );
};
