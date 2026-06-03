import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Typography, TextField, Button, CircularProgress,
  InputAdornment, IconButton, useMediaQuery, useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { setCredentials } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const gold = '#c9a96e';
const dark = '#0a0a0a';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      dispatch(setCredentials({ user: data.data.user, token: data.data.accessToken }));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Shared input style
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 0,
      color: 'white',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: gold },
      '&.Mui-focused fieldset': { borderColor: gold, borderWidth: 1 },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' },
    '& .MuiInputLabel-root.Mui-focused': { color: gold },
    '& input': { color: 'white', fontSize: '0.95rem' },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #1a1a1a inset',
      WebkitTextFillColor: 'white',
    },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: dark }}>

      {/* ── LEFT PANEL — hotel image (hidden on mobile) ── */}
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(10,10,10,0.7) 0%, rgba(10,10,10,0.4) 100%)',
            },
          }}
        >
          {/* Overlay content */}
          <Box sx={{ position: 'relative', zIndex: 1, p: 6, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box
              display="flex" alignItems="center" gap={1.5}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: gold, fontWeight: 700, fontFamily: 'serif', fontSize: '1.1rem' }}>G</Typography>
              </Box>
              <Box>
                <Typography sx={{ color: 'white', fontWeight: 700, letterSpacing: 3, fontFamily: 'serif', lineHeight: 1, fontSize: '1rem' }}>GRAND DIMA</Typography>
                <Typography sx={{ color: gold, fontSize: '0.55rem', letterSpacing: 5 }}>HOTEL · SHEGGER</Typography>
              </Box>
            </Box>

            {/* Quote */}
            <Box>
              <Box sx={{ width: 40, height: 2, bgcolor: gold, mb: 3 }} />
              <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontSize: '2rem', fontWeight: 700, lineHeight: 1.3, mb: 2, maxWidth: 400 }}>
                Where Elegance Meets Excellence
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: 1.8, maxWidth: 360 }}>
                Manage your hotel operations with precision and style. Every detail, perfectly handled.
              </Typography>
              <Typography sx={{ color: gold, fontSize: '0.65rem', letterSpacing: 3, fontFamily: 'sans-serif', mt: 3 }}>
                SHEGGER CITY · SEBETA SUB-CITY · ETHIOPIA
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── RIGHT PANEL — login form ── */}
      <Box
        sx={{
          width: { xs: '100%', md: 480 },
          flexShrink: 0,
          bgcolor: '#0f0f0f',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 4, sm: 6 },
          py: 6,
          position: 'relative',
        }}
      >
        {/* Mobile logo */}
        {isMobile && (
          <Box display="flex" alignItems="center" gap={1.5} mb={5} sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: gold, fontWeight: 700, fontFamily: 'serif' }}>G</Typography>
            </Box>
            <Box>
              <Typography sx={{ color: 'white', fontWeight: 700, letterSpacing: 2, fontFamily: 'serif', lineHeight: 1, fontSize: '0.9rem' }}>GRAND DIMA</Typography>
              <Typography sx={{ color: gold, fontSize: '0.5rem', letterSpacing: 4 }}>HOTEL · SHEGGER</Typography>
            </Box>
          </Box>
        )}

        {/* Heading */}
        <Box mb={5}>
          <Typography sx={{ color: gold, fontSize: '0.62rem', letterSpacing: 4, fontFamily: 'sans-serif', mb: 1.5 }}>
            STAFF PORTAL
          </Typography>
          <Typography sx={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: { xs: '2rem', md: '2.4rem' }, lineHeight: 1.2, mb: 1 }}>
            Welcome Back
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', fontSize: '0.88rem' }}>
            Sign in to access the management dashboard
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 0 }}>
            <Typography sx={{ color: '#f87171', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>{error}</Typography>
          </Box>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box mb={2.5}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', letterSpacing: 2.5, fontFamily: 'sans-serif', mb: 1 }}>
              EMAIL ADDRESS
            </Typography>
            <TextField
              fullWidth
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="admin@granddima.com"
              sx={inputSx}
            />
          </Box>

          <Box mb={4}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.62rem', letterSpacing: 2.5, fontFamily: 'sans-serif', mb: 1 }}>
              PASSWORD
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: gold } }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            disabled={loading || !email || !password}
            sx={{
              bgcolor: gold,
              color: dark,
              borderRadius: 0,
              py: 1.8,
              fontSize: '0.78rem',
              letterSpacing: 3,
              fontWeight: 700,
              fontFamily: 'sans-serif',
              mb: 3,
              '&:hover': { bgcolor: '#b8935a' },
              '&:disabled': { bgcolor: 'rgba(201,169,110,0.3)', color: 'rgba(0,0,0,0.4)' },
              transition: 'all 0.3s',
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: dark }} /> : 'SIGN IN'}
          </Button>

          {/* Back to site */}
          <Box textAlign="center">
            <Typography
              onClick={() => navigate('/')}
              sx={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.75rem',
                fontFamily: 'sans-serif',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'color 0.3s',
                '&:hover': { color: gold },
              }}
            >
              ← Back to Grand Dima Hotel
            </Typography>
          </Box>
        </Box>

        {/* Demo credentials */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 32,
            left: 0,
            right: 0,
            px: { xs: 4, sm: 6 },
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.15)' }}>
            <Typography sx={{ color: gold, fontSize: '0.58rem', letterSpacing: 2.5, fontFamily: 'sans-serif', mb: 1 }}>
              DEMO CREDENTIALS
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontFamily: 'sans-serif' }}>
              admin@hotel.com · Admin@123456
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
