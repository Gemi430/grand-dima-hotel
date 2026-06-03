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
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
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

// ── Brand colors matching the landing page ──────────────────────────────────
const gold = '#c9a96e';
const darkBg = '#0f0f0f';
const cardBg = '#1a1a1a';
const cardBorder = 'rgba(255,255,255,0.07)';

// Stat card with icon, color, value, label, and optional progress bar
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  progress?: number;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, subtitle, progress, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      bgcolor: cardBg,
      border: `1px solid ${cardBorder}`,
      p: 3,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0, left: 0,
        width: 3, height: '100%',
        bgcolor: color,
        opacity: 0,
        transition: 'opacity 0.3s',
      },
      '&:hover': onClick ? {
        borderColor: color,
        transform: 'translateY(-3px)',
        boxShadow: `0 12px 32px rgba(0,0,0,0.4)`,
        '&::before': { opacity: 1 },
      } : {},
    }}
  >
    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
      <Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem', letterSpacing: 2.5, fontFamily: 'sans-serif', mb: 1, textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: '2.2rem', lineHeight: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', fontFamily: 'sans-serif', mt: 0.75 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ color, opacity: 0.8, '& .MuiSvgIcon-root': { fontSize: 28 } }}>
        {icon}
      </Box>
    </Box>
    {progress !== undefined && (
      <Box mt={1.5}>
        <Box sx={{ height: 3, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${Math.min(progress, 100)}%`, bgcolor: color, borderRadius: 2, transition: 'width 1s ease' }} />
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontFamily: 'sans-serif', mt: 0.5 }}>
          {progress}% occupancy
        </Typography>
      </Box>
    )}
  </Box>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const user = useSelector((state: RootState) => state.auth.user);
  const role = user?.role || '';
  const canSeeRevenue = role === 'admin' || role === 'manager';
  const canSeeReservations = role === 'admin' || role === 'manager' || role === 'front_desk';

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Notification[]>([]);
  const [recentReservations, setRecentReservations] = useState<ReservationUpdate[]>([]);
  const [recentRoomUpdates, setRecentRoomUpdates] = useState<RoomStatusUpdate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown | null>(null);
  const [upcomingArrivals, setUpcomingArrivals] = useState<UpcomingArrival[]>([]);
  const [upcomingDepartures, setUpcomingDepartures] = useState<UpcomingDeparture[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<any[]>([]);
  const [nextUpdateIn, setNextUpdateIn] = useState(30);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch metrics — available to all roles
        const metricsRes = await fetch('http://localhost:3001/api/dashboard/metrics', { headers }).catch(() => null);
        if (metricsRes?.ok) {
          const d = await metricsRes.json();
          setMetrics(d.data);
          setLastUpdate(new Date());
        }

        // Housekeeping tasks — all roles can see the count
        const hkRes = await fetch('http://localhost:3001/api/housekeeping?limit=20&status=pending', { headers }).catch(() => null);
        if (hkRes?.ok) {
          const d = await hkRes.json();
          setHousekeepingTasks(d.data || []);
        }

        // Revenue breakdown — admin & manager only
        if (canSeeRevenue) {
          const revenueRes = await fetch('http://localhost:3001/api/dashboard/revenue-breakdown', { headers }).catch(() => null);
          if (revenueRes?.ok) {
            const d = await revenueRes.json();
            setRevenueBreakdown(d.data);
          }
        }

        // Arrivals & departures — admin, manager, front_desk
        if (canSeeReservations) {
          const [arrivalsRes, departuresRes] = await Promise.allSettled([
            fetch('http://localhost:3001/api/dashboard/upcoming-arrivals', { headers }),
            fetch('http://localhost:3001/api/dashboard/upcoming-departures', { headers }),
          ]);
          if (arrivalsRes.status === 'fulfilled' && arrivalsRes.value.ok) {
            const d = await arrivalsRes.value.json();
            setUpcomingArrivals(d.data || []);
          }
          if (departuresRes.status === 'fulfilled' && departuresRes.value.ok) {
            const d = await departuresRes.value.json();
            setUpcomingDepartures(d.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

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
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}
        sx={{ bgcolor: darkBg }}>
        <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={20} sx={{ color: gold }} thickness={3} />
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: 3, fontFamily: 'sans-serif' }}>
          LOADING DASHBOARD
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: darkBg, minHeight: '100vh', p: { xs: 2, sm: 3 } }}>

      {/* Page Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography sx={{ color: gold, fontSize: '0.62rem', letterSpacing: 4, fontFamily: 'sans-serif', mb: 0.75 }}>
            GRAND DIMA HOTEL
          </Typography>
          <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: { xs: '1.6rem', md: '2rem' } }}>
            {role === 'housekeeping' ? 'Housekeeping Dashboard' : role === 'front_desk' ? 'Front Desk Overview' : 'Dashboard Overview'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', fontSize: '0.82rem', mt: 0.5 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {!isConnected && (
            <Box sx={{ px: 2, py: 0.75, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <Typography sx={{ color: '#f87171', fontSize: '0.68rem', letterSpacing: 2, fontFamily: 'sans-serif' }}>OFFLINE</Typography>
            </Box>
          )}
          {lastUpdate && (
            <Box sx={{ px: 2, py: 0.75, bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid ${cardBorder}` }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', letterSpacing: 1.5, fontFamily: 'sans-serif' }}>
                Updated {getTimeSinceUpdate()}
              </Typography>
            </Box>
          )}
          {isConnected && (
            <Box sx={{ px: 2, py: 0.75, bgcolor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
              <Typography sx={{ color: '#10b981', fontSize: '0.68rem', letterSpacing: 2, fontFamily: 'sans-serif' }}>
                LIVE · {nextUpdateIn}s
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {!isConnected && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <Typography sx={{ color: '#f87171', fontSize: '0.82rem', fontFamily: 'sans-serif' }}>
            Real-time updates unavailable. Data may not reflect the latest changes.
          </Typography>
        </Box>
      )}

      {/* Primary Stats Row */}
      {metrics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              label="Total Rooms"
              value={metrics.occupancy.total}
              icon={<HotelIcon />}
              color={gold}
              subtitle="All room inventory"
              onClick={() => navigate('/rooms')}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              label="Available"
              value={metrics.occupancy.available}
              icon={<CheckCircleIcon />}
              color="#10b981"
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
              color="#ef4444"
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
              color={gold}
              subtitle="All transactions today"
              onClick={() => navigate('/billing')}
            />
          </Grid>
        </Grid>
      )}

      {/* Secondary Stats Row */}
      {metrics && (
        <Grid container spacing={3} mb={3}>
          {canSeeReservations && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Today's Arrivals"
                value={metrics.reservations.arrivals}
                icon={<ArrivalIcon />}
                color="#38bdf8"
                subtitle="Expected check-ins"
                onClick={() => navigate('/reservations')}
              />
            </Grid>
          )}
          {canSeeReservations && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                label="Today's Departures"
                value={metrics.reservations.departures}
                icon={<DepartureIcon />}
                color="#fb923c"
                subtitle="Expected check-outs"
                onClick={() => navigate('/reservations')}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Maintenance"
              value={metrics.occupancy.maintenance}
              icon={<MaintenanceIcon />}
              color="#fbbf24"
              subtitle="Rooms under maintenance"
              onClick={() => navigate('/rooms')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Housekeeping"
              value={metrics.housekeeping.pendingTasks}
              icon={<CleaningIcon />}
              color="#34d399"
              subtitle="Pending tasks"
              onClick={() => navigate('/housekeeping')}
            />
          </Grid>
        </Grid>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>

        {/* Revenue Breakdown — admin & manager only */}
        {canSeeRevenue && revenueBreakdown && (
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: cardBg, border: "1px solid ${cardBorder}", height: '100%', borderRadius: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>Revenue Breakdown</Typography>
                  <Chip label="Today" size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 600, fontSize: '0.7rem', border: 'none' }} />
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
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { bgcolor: item.color, borderRadius: 3 } }}
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

        {/* Upcoming Arrivals — front_desk, manager, admin */}
        {canSeeReservations && <Grid item xs={12} md={revenueBreakdown ? 4 : 6}>
          <Card sx={{ bgcolor: cardBg, border: "1px solid ${cardBorder}", height: '100%', borderRadius: 0 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'rgba(56,189,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrivalIcon sx={{ fontSize: 18, color: '#0891b2' }} />
                  </Box>
                  <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>Arrivals Today</Typography>
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
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(201,169,110,0.06)' } }}
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(201,169,110,0.15)', color: gold, fontSize: '0.8rem', fontWeight: 700 }}>
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
        </Grid>}

        {/* Upcoming Departures — front_desk, manager, admin */}
        {canSeeReservations && <Grid item xs={12} md={revenueBreakdown ? 4 : 6}>
          <Card sx={{ bgcolor: cardBg, border: "1px solid ${cardBorder}", height: '100%', borderRadius: 0 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DepartureIcon sx={{ fontSize: 18, color: '#d97706' }} />
                  </Box>
                  <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>Departures Today</Typography>
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
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(251,146,60,0.06)' } }}
                    >
                      <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(251,146,60,0.15)', color: '#fb923c', fontSize: '0.8rem', fontWeight: 700 }}>
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
        </Grid>}

        {/* Housekeeping Tasks Panel — shown to housekeeping role */}
        {role === 'housekeeping' && housekeepingTasks.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'rgba(212,167,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CleaningIcon sx={{ fontSize: 18, color: '#d97706' }} />
                    </Box>
                    <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>My Pending Tasks</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => navigate('/housekeeping')} sx={{ color: 'text.secondary' }}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {housekeepingTasks.slice(0, 8).map((task: any) => (
                    <Box key={task._id} display="flex" alignItems="center" gap={2}
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ color: 'white' }}>
                          Room {task.roomId?.roomNumber || '—'} · {task.taskType?.replace(/_/g, ' ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.description || 'No description'} · Priority: {task.priority}
                        </Typography>
                      </Box>
                      <Chip
                        label={task.status?.replace('_', ' ')}
                        size="small"
                        color={task.status === 'in_progress' ? 'primary' : 'default'}
                        sx={{ fontSize: '0.7rem', height: 22, textTransform: 'capitalize' }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Recent Reservation Updates (live) — admin, manager, front_desk */}
        {canSeeReservations && recentReservations.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: cardBg, border: "1px solid ${cardBorder}", borderRadius: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookingIcon sx={{ fontSize: 18, color: '#7c3aed' }} />
                    </Box>
                    <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>Live Booking Updates</Typography>
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
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(201,169,110,0.1)', color: gold, fontSize: '0.75rem', fontWeight: 700 }}>
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
            <Card sx={{ bgcolor: cardBg, border: "1px solid ${cardBorder}", borderRadius: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: 'rgba(201,169,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HotelIcon sx={{ fontSize: 18, color: '#2563eb' }} />
                    </Box>
                    <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>Room Status Updates</Typography>
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
                        sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: sc.bg, border: '1px solid rgba(255,255,255,0.07)', minWidth: 120 }}
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
            <Card sx={{ bgcolor: cardBg, border: "1px solid ${cardBorder}", borderRadius: 0 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }} mb={2}>
                  System Alerts
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {recentAlerts.map((alert) => (
                    <Alert
                      key={alert.id}
                      severity={alert.type as any}
                      sx={{ borderRadius: 0, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', '& .MuiAlert-message': { width: '100%' } }}
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
