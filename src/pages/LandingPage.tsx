import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Grid, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, IconButton, Drawer, List, ListItem,
  Avatar, Rating, useMediaQuery, useTheme, Tab, Tabs,
} from '@mui/material';
import {
  Menu as MenuIcon, Close as CloseIcon,
  Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Wifi as WifiIcon, Pool as PoolIcon, Restaurant as RestaurantIcon,
  FitnessCenter as GymIcon, Spa as SpaIcon, LocalParking as ParkingIcon,
  LocalBar as BarIcon, RoomService as RoomServiceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Room {
  _id: string; roomNumber: string;
  roomType: { name: string; category: string; maxOccupancy: number; bedConfiguration: string; size: number; amenities: string[]; basePrice: number; description?: string; };
  floor: number;
  features: { hasBalcony: boolean; hasKitchen: boolean; hasJacuzzi: boolean; oceanView: boolean; smokingAllowed: boolean; petFriendly: boolean; };
  pricing: { baseRate: number };
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_ROOMS: Room[] = [
  { _id: '1', roomNumber: '101', floor: 1, roomType: { name: 'Classic Room', category: 'Standard', maxOccupancy: 2, bedConfiguration: 'King Bed', size: 320, amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC'], basePrice: 3200, description: 'Elegant comfort with city views' }, features: { hasBalcony: false, hasKitchen: false, hasJacuzzi: false, oceanView: false, smokingAllowed: false, petFriendly: false }, pricing: { baseRate: 3200 } },
  { _id: '2', roomNumber: '205', floor: 2, roomType: { name: 'Deluxe Room', category: 'Deluxe', maxOccupancy: 2, bedConfiguration: 'King Bed', size: 420, amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Bathrobe'], basePrice: 4800, description: 'Spacious luxury with premium finishes' }, features: { hasBalcony: true, hasKitchen: false, hasJacuzzi: false, oceanView: false, smokingAllowed: false, petFriendly: false }, pricing: { baseRate: 4800 } },
  { _id: '3', roomNumber: '310', floor: 3, roomType: { name: 'Garden Suite', category: 'Suite', maxOccupancy: 3, bedConfiguration: 'King Bed + Sofa', size: 680, amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Bathrobe', 'Butler'], basePrice: 7500, description: 'Garden views with private terrace' }, features: { hasBalcony: true, hasKitchen: false, hasJacuzzi: true, oceanView: false, smokingAllowed: false, petFriendly: false }, pricing: { baseRate: 7500 } },
  { _id: '4', roomNumber: '402', floor: 4, roomType: { name: 'Family Suite', category: 'Suite', maxOccupancy: 4, bedConfiguration: '2 Queen Beds', size: 760, amenities: ['WiFi', 'TV', 'Mini Bar', 'Safe', 'AC', 'Kitchen'], basePrice: 9200, description: 'Perfect for families with separate living area' }, features: { hasBalcony: true, hasKitchen: true, hasJacuzzi: false, oceanView: false, smokingAllowed: false, petFriendly: true }, pricing: { baseRate: 9200 } },
  { _id: '5', roomNumber: '501', floor: 5, roomType: { name: 'Penthouse', category: 'Penthouse', maxOccupancy: 4, bedConfiguration: 'King Bed + 2 Singles', size: 1200, amenities: ['WiFi', 'TV', 'Full Bar', 'Safe', 'AC', 'Kitchen', 'Butler'], basePrice: 18000, description: 'The pinnacle of luxury with rooftop terrace' }, features: { hasBalcony: true, hasKitchen: true, hasJacuzzi: true, oceanView: false, smokingAllowed: false, petFriendly: false }, pricing: { baseRate: 18000 } },
  { _id: '6', roomNumber: '203', floor: 2, roomType: { name: 'Twin Room', category: 'Standard', maxOccupancy: 2, bedConfiguration: '2 Twin Beds', size: 300, amenities: ['WiFi', 'TV', 'Safe', 'AC'], basePrice: 2800, description: 'Ideal for colleagues or friends travelling together' }, features: { hasBalcony: false, hasKitchen: false, hasJacuzzi: false, oceanView: false, smokingAllowed: false, petFriendly: false }, pricing: { baseRate: 2800 } },
];

// Menu items now include photos and ETB pricing
const MOCK_MENU = {
  breakfast: [
    { name: 'Grand Dima Breakfast', nameAm: 'ግራንድ ዲማ ቁርስ', desc: 'Firfir, scrambled eggs, fresh injera, honey, Ethiopian tea', price: 320, tag: 'Signature', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80' },
    { name: 'Full Ethiopian Spread', nameAm: 'ሙሉ የኢትዮጵያ ቁርስ', desc: 'Genfo, kinche, chechebsa, fresh fruit, macchiato', price: 280, tag: '', img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80' },
    { name: 'Avocado & Eggs', nameAm: 'አቮካዶ እና እንቁላል', desc: 'Poached eggs, fresh avocado, whole-grain toast, orange juice', price: 240, tag: "Chef's Pick", img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80' },
    { name: 'Fruit & Yogurt Bowl', nameAm: 'ፍራፍሬ እና እርጎ', desc: 'Seasonal fruits, local yogurt, granola, honey drizzle', price: 180, tag: 'Healthy', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80' },
  ],
  lunch: [
    { name: 'Tibs Special', nameAm: 'ልዩ ጥብስ', desc: 'Tender beef tibs, awaze, rosemary, served with injera', price: 480, tag: 'Signature', img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80' },
    { name: 'Shiro Wot', nameAm: 'ሽሮ ወጥ', desc: 'Slow-cooked spiced chickpea stew, niter kibbeh, injera', price: 220, tag: 'Vegetarian', img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80' },
    { name: 'Grilled Nile Tilapia', nameAm: 'የተጠበሰ ዓሳ', desc: 'Fresh tilapia, lemon herb butter, rice, seasonal salad', price: 420, tag: "Chef's Pick", img: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80' },
    { name: 'Club Sandwich', nameAm: 'ክለብ ሳንድዊች', desc: 'Triple-decker, grilled chicken, bacon, tomato, fries', price: 350, tag: '', img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80' },
  ],
  dinner: [
    { name: 'Doro Wot', nameAm: 'ዶሮ ወጥ', desc: 'Slow-simmered chicken in berbere, boiled egg, injera — Ethiopia\'s finest', price: 680, tag: 'Signature', img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&q=80' },
    { name: 'Kitfo', nameAm: 'ክትፎ', desc: 'Prime minced beef, mitmita, niter kibbeh, ayib, gomen', price: 750, tag: "Chef's Pick", img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80' },
    { name: 'Lamb Alicha', nameAm: 'የበግ አልጫ', desc: 'Tender lamb, turmeric, ginger, potatoes, mild spices', price: 620, tag: '', img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80' },
    { name: 'Vegetarian Beyaynetu', nameAm: 'የጾም ፍርፍር', desc: 'Assorted fasting dishes — misir, gomen, tikil gomen, shiro', price: 380, tag: 'Vegetarian', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80' },
  ],
  drinks: [
    { name: 'Ethiopian Coffee Ceremony', nameAm: 'የቡና ሥነ ሥርዓት', desc: 'Traditional jebena coffee, three rounds, popcorn, incense', price: 180, tag: 'Signature', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80' },
    { name: 'Fresh Avocado Juice', nameAm: 'አቮካዶ ጁስ', desc: 'Blended avocado, mango, papaya — layered Ethiopian style', price: 120, tag: 'Popular', img: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&q=80' },
    { name: 'Tej (Honey Wine)', nameAm: 'ጠጅ', desc: 'Traditional Ethiopian honey mead, served in berele glass', price: 150, tag: 'Traditional', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80' },
    { name: 'Spiced Macchiato', nameAm: 'ማኪያቶ', desc: 'Double espresso, steamed milk, cardamom, cinnamon', price: 80, tag: 'Non-Alcoholic', img: 'https://images.unsplash.com/photo-1485808191679-5f86510bd9d4?w=600&q=80' },
  ],
};

const ROOM_IMAGES: Record<string, string> = {
  classic: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  deluxe: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
  ocean: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  suite: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  family: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
  penthouse: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
  twin: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
};

const getRoomImage = (name: string) => {
  const l = name.toLowerCase();
  if (l.includes('penthouse')) return ROOM_IMAGES.penthouse;
  if (l.includes('family')) return ROOM_IMAGES.family;
  if (l.includes('ocean')) return ROOM_IMAGES.ocean;
  if (l.includes('deluxe')) return ROOM_IMAGES.deluxe;
  if (l.includes('twin')) return ROOM_IMAGES.twin;
  if (l.includes('suite')) return ROOM_IMAGES.suite;
  return ROOM_IMAGES.classic;
};

const STATS = [
  { value: '120+', label: 'Luxury Rooms' },
  { value: '8K+', label: 'Happy Guests' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '24/7', label: 'Concierge' },
];

const AMENITIES = [
  { icon: <WifiIcon />, label: 'Free WiFi' },
  { icon: <PoolIcon />, label: 'Infinity Pool' },
  { icon: <RestaurantIcon />, label: 'Fine Dining' },
  { icon: <GymIcon />, label: 'Fitness Center' },
  { icon: <SpaIcon />, label: 'Spa & Wellness' },
  { icon: <ParkingIcon />, label: 'Valet Parking' },
  { icon: <BarIcon />, label: 'Rooftop Bar' },
  { icon: <RoomServiceIcon />, label: 'Room Service' },
];

const TESTIMONIALS = [
  { name: 'Tigist Alemu', role: 'Travel Blogger', rating: 5, text: 'ግራንድ ዲማ ሆቴል ከሄድኩባቸው ሆቴሎች ሁሉ ምርጡ ነው። አገልግሎቱ፣ ምግቡ እና ክፍሎቹ ሁሉ ፍጹም ናቸው።', avatar: 'T' },
  { name: 'Dawit Bekele', role: 'Business Executive', rating: 5, text: 'For business travel, Grand Dima is my only choice in Shegger City. The rooms are exquisite and the staff anticipates every need.', avatar: 'D' },
  { name: 'Amina Yusuf', role: 'Honeymoon Guest', rating: 5, text: 'ለሠርጋችን ግራንድ ዲማን መርጠናል — ከሚጠበቀው በላይ ነበር። ሱቱ ድንቅ ነበር፣ አገልግሎቱ ፍጹም ነበር።', avatar: 'A' },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
];

// ─── GOLD LABEL ───────────────────────────────────────────────────────────────
const GoldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ color: '#c9a96e', letterSpacing: 5, fontSize: '0.68rem', mb: 2, fontFamily: 'sans-serif', fontWeight: 500 }}>
    {children}
  </Typography>
);

// ─── SECTION HEADING ─────────────────────────────────────────────────────────
const SectionHeading: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center }) => (
  <Typography variant="h2" sx={{ color: 'white', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.2, textAlign: center ? 'center' : 'left' }}>
    {children}
  </Typography>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menuTab, setMenuTab] = useState(0);

  // ── Scroll-reveal: observe every [data-reveal] element ──────────────────────
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      [data-reveal] {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.75s cubic-bezier(0.4,0,0.2,1), transform 0.75s cubic-bezier(0.4,0,0.2,1);
      }
      [data-reveal].revealed {
        opacity: 1;
        transform: translateY(0);
      }
      [data-reveal="left"] { transform: translateX(-50px); }
      [data-reveal="left"].revealed { transform: translateX(0); }
      [data-reveal="right"] { transform: translateX(50px); }
      [data-reveal="right"].revealed { transform: translateX(0); }
      [data-reveal="scale"] { transform: scale(0.88); }
      [data-reveal="scale"].revealed { transform: scale(1); }
      [data-delay="100"] { transition-delay: 0.1s; }
      [data-delay="200"] { transition-delay: 0.2s; }
      [data-delay="300"] { transition-delay: 0.3s; }
      [data-delay="400"] { transition-delay: 0.4s; }
      [data-delay="500"] { transition-delay: 0.5s; }
      [data-delay="600"] { transition-delay: 0.6s; }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    // Observe after a short delay so elements are mounted
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  // Fixed 1-night default for booking dialog preview
  const calcNights = () => 1;
  const calcTotal = (rate: number) => (rate * 1.1 + 200).toLocaleString();

  const NAV = ['Home', 'Rooms', 'Menu', 'Experience', 'Gallery', 'Contact'];
  const MENU_TABS = ['Breakfast', 'Lunch', 'Dinner', 'Drinks'];
  const menuData = [MOCK_MENU.breakfast, MOCK_MENU.lunch, MOCK_MENU.dinner, MOCK_MENU.drinks];

  const gold = '#c9a96e';
  const dark = '#0a0a0a';

  return (
    <Box sx={{ bgcolor: dark, color: 'white', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════════════════════ */}
      <Box component="nav" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1200,
        transition: 'all 0.4s ease',
        bgcolor: scrolled ? 'rgba(10,10,10,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid rgba(255,255,255,0.07)` : 'none',
        py: scrolled ? 1.5 : 2.5,
        px: { xs: 2.5, md: 6 },
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: 'pointer' }} onClick={() => scrollTo('hero')}>
          <Box sx={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography sx={{ color: gold, fontWeight: 700, fontSize: '1.1rem', fontFamily: 'serif', lineHeight: 1 }}>G</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1rem', lineHeight: 1, letterSpacing: 2, fontFamily: 'serif' }}>GRAND DIMA</Typography>
            <Typography sx={{ color: gold, fontSize: '0.55rem', letterSpacing: 4, lineHeight: 1.4 }}>HOTEL · SHEGGER</Typography>
          </Box>
        </Box>

        {/* Desktop links */}
        {!isMobile && (
          <Box display="flex" gap={3.5} alignItems="center">
            {NAV.map((link) => (
              <Typography key={link} onClick={() => scrollTo(link.toLowerCase())} sx={{
                color: 'rgba(255,255,255,0.72)', fontSize: '0.75rem', letterSpacing: 2.5,
                cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: 500,
                transition: 'color 0.3s', '&:hover': { color: gold },
              }}>
                {link.toUpperCase()}
              </Typography>
            ))}
          </Box>
        )}

        <Box display="flex" alignItems="center" gap={2}>
          {!isMobile && (
            <Button onClick={() => navigate('/login')} sx={{
              color: gold, border: `1px solid ${gold}`, borderRadius: 0,
              px: 3, py: 0.9, fontSize: '0.68rem', letterSpacing: 2.5,
              fontFamily: 'sans-serif', fontWeight: 600,
              '&:hover': { bgcolor: gold, color: dark }, transition: 'all 0.3s',
            }}>STAFF LOGIN</Button>
          )}
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { bgcolor: '#0d0d0d', width: 280, p: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography sx={{ color: gold, fontFamily: 'serif', fontWeight: 700, letterSpacing: 2 }}>GRAND DIMA HOTEL</Typography>
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
        </Box>
        <List disablePadding>
          {NAV.map((link) => (
            <ListItem key={link} onClick={() => scrollTo(link.toLowerCase())} sx={{ cursor: 'pointer', py: 1.5, px: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 3, fontSize: '0.82rem', fontFamily: 'sans-serif' }}>{link.toUpperCase()}</Typography>
            </ListItem>
          ))}
        </List>
        <Button fullWidth onClick={() => navigate('/login')} sx={{ mt: 4, color: gold, border: `1px solid ${gold}`, borderRadius: 0, py: 1.5, letterSpacing: 2, fontSize: '0.75rem', '&:hover': { bgcolor: gold, color: dark } }}>
          STAFF LOGIN
        </Button>
      </Drawer>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <Box
        id="hero"
        sx={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          minHeight: { xs: 700, md: 800 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          ml: 'calc(-50vw + 50%)', // break out of any parent padding
        }}
      >
        {/* Background image — mobile uses top-center for portrait */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90)',
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center top', md: 'center center' },
          transform: { xs: 'scale(1.05)', md: 'scale(1)' },
          transition: 'transform 8s ease-out',
          '&::after': {
            content: '""', position: 'absolute', inset: 0,
            background: {
              xs: 'linear-gradient(to bottom, rgba(10,10,10,0.65) 0%, rgba(10,10,10,0.45) 35%, rgba(10,10,10,0.85) 100%)',
              md: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.25) 40%, rgba(10,10,10,0.8) 100%)',
            },
          },
        }} />

        {/* Hero content */}
        <Box sx={{
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          px: { xs: 3, sm: 5, md: 4 },
          maxWidth: { xs: '100%', md: 860 },
          mx: 'auto',
          mt: { xs: 4, md: 0 },
        }}>
          {/* Eyebrow label */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1.5,
            mb: { xs: 2.5, md: 3 },
          }}>
            <Box sx={{ width: 28, height: 1, bgcolor: gold, opacity: 0.7 }} />
            <Typography sx={{
              color: gold, letterSpacing: { xs: 4, md: 6 },
              fontSize: { xs: '0.62rem', md: '0.7rem' },
              fontFamily: 'sans-serif', fontWeight: 500,
            }}>
              LUXURY HOSPITALITY · SINCE 2018
            </Typography>
            <Box sx={{ width: 28, height: 1, bgcolor: gold, opacity: 0.7 }} />
          </Box>

          {/* Hotel name */}
          <Typography variant="h1" sx={{
            color: 'white',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: { xs: '2.8rem', sm: '4.2rem', md: '6rem' },
            lineHeight: { xs: 1.1, md: 1.05 },
            mb: { xs: 1.5, md: 2 },
            textShadow: '0 4px 40px rgba(0,0,0,0.6)',
            letterSpacing: { xs: '-0.5px', md: '-1px' },
          }}>
            Grand Dima Hotel
          </Typography>

          {/* Location */}
          <Typography sx={{
            color: gold,
            fontFamily: 'serif',
            fontSize: { xs: '0.85rem', md: '1rem' },
            mb: { xs: 2.5, md: 3 },
            letterSpacing: 1.5,
            opacity: 0.9,
          }}>
            ሸገር ከተማ፣ ሰቤታ ክፍለ ከተማ
          </Typography>

          {/* Tagline */}
          <Typography sx={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: { xs: '0.9rem', md: '1.1rem' },
            maxWidth: { xs: '100%', md: 520 },
            mx: 'auto',
            mb: { xs: 4, md: 5 },
            lineHeight: 1.85,
            fontFamily: 'sans-serif',
            fontWeight: 300,
            px: { xs: 1, md: 0 },
          }}>
            Where timeless elegance meets modern luxury. Every stay is a story worth telling.
          </Typography>

          {/* CTA Buttons */}
          <Box display="flex" gap={{ xs: 1.5, md: 2 }} justifyContent="center" flexWrap="wrap">
            <Button
              onClick={() => scrollTo('rooms')}
              sx={{
                bgcolor: gold, color: dark,
                borderRadius: 0,
                px: { xs: 3.5, md: 5 },
                py: { xs: 1.6, md: 1.8 },
                fontSize: { xs: '0.72rem', md: '0.78rem' },
                letterSpacing: { xs: 2, md: 3 },
                fontWeight: 700, fontFamily: 'sans-serif',
                minWidth: { xs: 140, md: 'auto' },
                '&:hover': { bgcolor: '#b8935a', transform: 'translateY(-2px)' },
                transition: 'all 0.3s',
              }}
            >
              EXPLORE ROOMS
            </Button>
            <Button
              onClick={() => scrollTo('contact')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 0,
                px: { xs: 3.5, md: 5 },
                py: { xs: 1.6, md: 1.8 },
                fontSize: { xs: '0.72rem', md: '0.78rem' },
                letterSpacing: { xs: 2, md: 3 },
                fontFamily: 'sans-serif',
                minWidth: { xs: 140, md: 'auto' },
                '&:hover': { borderColor: gold, color: gold },
                transition: 'all 0.3s',
              }}
            >
              BOOK A STAY
            </Button>
          </Box>
        </Box>

        {/* Bottom info strip — visible on mobile and desktop */}
        <Box sx={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 3, md: 6 },
          px: { xs: 3, md: 6 },
          py: { xs: 2, md: 2.5 },
          bgcolor: 'rgba(10,10,10,0.55)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: '📍', text: 'Sebeta, Shegger City' },
            { icon: '📞', text: '+251 911 000 000' },
            { icon: '🕐', text: 'Open 24 Hours' },
          ].map((item) => (
            <Box key={item.text} display="flex" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}>{item.icon}</Typography>
              <Typography sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: { xs: '0.68rem', md: '0.75rem' },
                fontFamily: 'sans-serif',
                letterSpacing: 0.5,
              }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Scroll indicator */}
        <Box
          onClick={() => scrollTo('stats')}
          sx={{
            position: 'absolute',
            bottom: { xs: 72, md: 80 },
            left: '50%', transform: 'translateX(-50%)',
            cursor: 'pointer',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column', alignItems: 'center', gap: 0.75,
            animation: 'bounce 2s infinite',
            '@keyframes bounce': {
              '0%,100%': { transform: 'translateX(-50%) translateY(0)' },
              '50%': { transform: 'translateX(-50%) translateY(-8px)' },
            },
          }}
        >
          <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.58rem', letterSpacing: 4, fontFamily: 'sans-serif' }}>SCROLL</Typography>
          <ArrowDownIcon sx={{ color: gold, fontSize: 16 }} />
        </Box>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <Box id="stats" sx={{
        position: 'relative',
        py: { xs: 5, md: 7 },
        background: 'linear-gradient(135deg, #1a1208 0%, #2a1e0a 40%, #1a1208 100%)',
        borderTop: '1px solid rgba(201,169,110,0.15)',
        borderBottom: '1px solid rgba(201,169,110,0.15)',
        overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(201,169,110,0.06) 0%, transparent 60%)',
        },
      }}>
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 1, px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Grid container>
            {STATS.map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box
                  textAlign="center"
                  sx={{
                    py: { xs: 2, md: 3 },
                    px: 2,
                    position: 'relative',
                    '&::after': i < 3 ? {
                      content: '""',
                      position: 'absolute',
                      right: 0, top: '20%', bottom: '20%',
                      width: '1px',
                      bgcolor: 'rgba(201,169,110,0.2)',
                      display: { xs: 'none', md: 'block' },
                    } : {},
                  }}
                >
                  <Typography sx={{
                    color: gold,
                    fontWeight: 800,
                    fontSize: { xs: '2.2rem', md: '3rem' },
                    fontFamily: '"Playfair Display", Georgia, serif',
                    lineHeight: 1,
                    mb: 0.75,
                    textShadow: `0 0 40px rgba(201,169,110,0.3)`,
                  }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.65rem',
                    letterSpacing: 3,
                    fontFamily: 'sans-serif',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          ROOMS
      ══════════════════════════════════════════════════════════════ */}
      <Box id="rooms" sx={{ bgcolor: '#0f0f0f', py: { xs: 8, md: 12 } }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Box textAlign="center" mb={7}>
            <GoldLabel>ACCOMMODATIONS</GoldLabel>
            <SectionHeading center>Curated Rooms & Suites</SectionHeading>
            <Typography data-reveal sx={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480, mx: 'auto', fontFamily: 'sans-serif', lineHeight: 1.9, fontSize: '0.92rem', mt: 2 }}>
              Each space is thoughtfully designed to offer the perfect balance of comfort, elegance, and modern amenity.
            </Typography>
          </Box>

          {/* Room grid */}
          <Grid container spacing={3}>
            {rooms.map((room, idx) => (
              <Grid item xs={12} sm={6} lg={4} key={room._id}
                // @ts-ignore
                data-reveal data-delay={String((idx % 3) * 150)}
              >
                <Box onClick={() => { setSelectedRoom(room); setBookingOpen(true); }} sx={{ cursor: 'pointer', '&:hover .ri': { transform: 'scale(1.07)' }, '&:hover .ro': { opacity: 1 } }}>
                  <Box sx={{ height: 260, overflow: 'hidden', position: 'relative' }}>
                    <Box className="ri" sx={{ height: '100%', backgroundImage: `url(${getRoomImage(room.roomType.name)})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.6s ease' }} />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 55%)' }} />
                    <Box className="ro" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(201,169,110,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.4s ease' }}>
                      <Typography sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.7)', px: 3, py: 1, fontSize: '0.72rem', letterSpacing: 3, fontFamily: 'sans-serif' }}>VIEW DETAILS</Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: 14, right: 14, bgcolor: gold, px: 1.75, py: 0.6 }}>
                      <Typography sx={{ color: dark, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'sans-serif', lineHeight: 1 }}>
                        ETB {room.pricing.baseRate.toLocaleString()}<Typography component="span" sx={{ fontSize: '0.6rem', fontWeight: 400 }}>/night</Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 14, left: 14 }}>
                      <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1.05rem', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{room.roomType.name}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: '#181818', p: 2.5, borderBottom: `2px solid ${gold}` }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontFamily: 'sans-serif' }}>
                        {room.roomType.bedConfiguration} · {room.roomType.maxOccupancy} guests · {room.roomType.size} sq ft
                      </Typography>
                      <Rating value={5} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: gold }, '& .MuiRating-iconEmpty': { color: 'rgba(201,169,110,0.25)' } }} />
                    </Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.78rem', fontFamily: 'sans-serif', fontStyle: 'italic' }}>
                      {room.roomType.description}
                    </Typography>
                    <Box display="flex" gap={0.75} flexWrap="wrap" mt={1.5}>
                      {room.features.oceanView && <Chip label="Ocean View" size="small" sx={{ bgcolor: 'rgba(201,169,110,0.1)', color: gold, border: `1px solid rgba(201,169,110,0.25)`, fontSize: '0.62rem', height: 20 }} />}
                      {room.features.hasBalcony && <Chip label="Balcony" size="small" sx={{ bgcolor: 'rgba(201,169,110,0.1)', color: gold, border: `1px solid rgba(201,169,110,0.25)`, fontSize: '0.62rem', height: 20 }} />}
                      {room.features.hasJacuzzi && <Chip label="Jacuzzi" size="small" sx={{ bgcolor: 'rgba(201,169,110,0.1)', color: gold, border: `1px solid rgba(201,169,110,0.25)`, fontSize: '0.62rem', height: 20 }} />}
                      {room.features.hasKitchen && <Chip label="Kitchen" size="small" sx={{ bgcolor: 'rgba(201,169,110,0.1)', color: gold, border: `1px solid rgba(201,169,110,0.25)`, fontSize: '0.62rem', height: 20 }} />}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          MENU / DINING
      ══════════════════════════════════════════════════════════════ */}
      <Box id="menu" sx={{ bgcolor: dark, py: { xs: 8, md: 12 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Box textAlign="center" mb={6} data-reveal>
            <GoldLabel>DINING & BAR</GoldLabel>
            <SectionHeading center>A Culinary Journey</SectionHeading>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', maxWidth: 480, mx: 'auto', fontFamily: 'sans-serif', lineHeight: 1.9, fontSize: '0.92rem', mt: 2 }}>
              From sunrise breakfasts to candlelit dinners — every meal is crafted with passion and the finest ingredients.
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', mb: 5 }} data-reveal data-delay="100">
            <Tabs value={menuTab} onChange={(_, v) => setMenuTab(v)} centered={!isMobile} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto"
              TabIndicatorProps={{ style: { backgroundColor: gold, height: 2 } }}
              sx={{ '& .MuiTab-root': { color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif', letterSpacing: 2.5, fontSize: '0.72rem', fontWeight: 600, minWidth: 100, '&.Mui-selected': { color: gold } } }}>
              {MENU_TABS.map((t) => <Tab key={t} label={t.toUpperCase()} disableRipple />)}
            </Tabs>
          </Box>

          {/* Menu items grid — with photos */}
          <Grid container spacing={3}>
            {menuData[menuTab].map((item: any, i: number) => (
              <Grid item xs={12} sm={6} key={i}
                // @ts-ignore
                data-reveal data-delay={String(i % 2 === 0 ? 0 : 150)}
              >
                <Box sx={{ border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', transition: 'all 0.3s', '&:hover': { borderColor: gold } }}>
                  {/* Photo */}
                  <Box sx={{ height: 180, overflow: 'hidden', position: 'relative', '&:hover .mi': { transform: 'scale(1.06)' } }}>
                    <Box className="mi" sx={{ height: '100%', backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.5s ease' }} />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.7) 0%, transparent 60%)' }} />
                    {item.tag && (
                      <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                        <Chip label={item.tag} size="small" sx={{ bgcolor: gold, color: dark, fontSize: '0.6rem', height: 20, fontWeight: 700 }} />
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
                      <Typography sx={{ color: gold, fontFamily: 'serif', fontWeight: 700, fontSize: '1rem' }}>ETB {item.price}</Typography>
                    </Box>
                  </Box>
                  {/* Info */}
                  <Box sx={{ p: 2.5, bgcolor: '#181818' }}>
                    <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem', mb: 0.25 }}>{item.name}</Typography>
                    <Typography sx={{ color: gold, fontFamily: 'serif', fontSize: '0.82rem', mb: 1, fontStyle: 'italic' }}>{item.nameAm}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.7 }}>{item.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center" mt={6}>
            <Button onClick={() => scrollTo('contact')} sx={{ color: gold, border: `1px solid ${gold}`, borderRadius: 0, px: 5, py: 1.6, fontSize: '0.72rem', letterSpacing: 3, fontFamily: 'sans-serif', fontWeight: 600, '&:hover': { bgcolor: gold, color: dark }, transition: 'all 0.3s' }}>
              RESERVE A TABLE
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          EXPERIENCE
      ══════════════════════════════════════════════════════════════ */}
      <Box id="experience" sx={{ bgcolor: '#0c0c0c', py: { xs: 8, md: 14 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            <Grid item xs={12} md={5}
              // @ts-ignore
              data-reveal="left"
            >
              <GoldLabel>THE EXPERIENCE</GoldLabel>
              <SectionHeading>More Than a Stay —{'\n'}A Memory</SectionHeading>
              <Typography sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.95, fontFamily: 'sans-serif', fontSize: '0.92rem', mt: 2.5, mb: 4.5 }}>
                Located in Shegger City, Sebeta Sub-city — from the moment you arrive, our dedicated team ensures your experience is nothing short of extraordinary.
              </Typography>
              {[
                { title: 'World-Class Chefs', desc: 'Culinary excellence crafted from the finest local and international ingredients.' },
                { title: 'Personalized Service', desc: 'Our concierge team anticipates your every need, 24 hours a day.' },
                { title: 'Signature Spa', desc: 'Rejuvenate with our bespoke wellness treatments and therapies.' },
              ].map((item, idx) => (
                <Box key={item.title} display="flex" gap={2.5} alignItems="flex-start" mb={3}
                  // @ts-ignore
                  data-reveal data-delay={String((idx + 1) * 150)}
                >
                  <Box sx={{ width: 2, minHeight: 44, bgcolor: gold, flexShrink: 0, mt: 0.25 }} />
                  <Box>
                    <Typography sx={{ color: 'white', fontWeight: 600, fontFamily: 'serif', fontSize: '1rem', mb: 0.4 }}>{item.title}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.84rem', fontFamily: 'sans-serif', lineHeight: 1.7 }}>{item.desc}</Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={7}
              // @ts-ignore
              data-reveal="right"
            >
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <Box sx={{ height: { xs: 220, md: 300 }, backgroundImage: 'url(https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ height: { xs: 220, md: 300 }, backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ height: { xs: 160, md: 200 }, backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </Grid>
                <Grid item xs={8}>
                  <Box sx={{ height: { xs: 160, md: 200 }, backgroundImage: 'url(https://images.unsplash.com/photo-1590490360182-c33d57733427?w=700&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          AMENITIES
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#111', py: { xs: 8, md: 12 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Box textAlign="center" mb={7} data-reveal>
            <GoldLabel>FACILITIES</GoldLabel>
            <SectionHeading center>World-Class Amenities</SectionHeading>
          </Box>
          <Grid container spacing={2}>
            {AMENITIES.map((a, i) => (
              <Grid item xs={6} sm={4} md={3} key={i}
                // @ts-ignore
                data-reveal data-delay={String((i % 4) * 100)}
              >
                <Box textAlign="center" sx={{ p: { xs: 2.5, md: 3.5 }, border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.3s', '&:hover': { borderColor: gold, bgcolor: 'rgba(201,169,110,0.05)', transform: 'translateY(-4px)' } }}>
                  <Box sx={{ color: gold, mb: 1.5, '& .MuiSvgIcon-root': { fontSize: 30 } }}>{a.icon}</Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem', fontFamily: 'sans-serif', letterSpacing: 1 }}>{a.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: dark, py: { xs: 8, md: 12 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Box textAlign="center" mb={7} data-reveal>
            <GoldLabel>GUEST REVIEWS</GoldLabel>
            <SectionHeading center>What Our Guests Say</SectionHeading>
          </Box>
          <Grid container spacing={3}>
            {TESTIMONIALS.map((t, i) => (
              <Grid item xs={12} md={4} key={i}
                // @ts-ignore
                data-reveal data-delay={String(i * 150)}
              >
                <Box sx={{ p: { xs: 3, md: 4 }, border: '1px solid rgba(255,255,255,0.08)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s', '&:hover': { borderColor: gold, transform: 'translateY(-6px)' } }}>
                  <Rating value={t.rating} readOnly size="small" sx={{ mb: 2.5, '& .MuiRating-iconFilled': { color: gold }, '& .MuiRating-iconEmpty': { color: 'rgba(201,169,110,0.2)' } }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'serif', fontSize: '0.97rem', lineHeight: 1.85, flexGrow: 1, fontStyle: 'italic', mb: 3 }}>"{t.text}"</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: gold, color: dark, fontWeight: 700, width: 44, height: 44, fontSize: '1rem' }}>{t.avatar}</Avatar>
                    <Box>
                      <Typography sx={{ color: 'white', fontWeight: 600, fontFamily: 'serif', fontSize: '0.95rem' }}>{t.name}</Typography>
                      <Typography sx={{ color: gold, fontSize: '0.7rem', fontFamily: 'sans-serif', letterSpacing: 1.5 }}>{t.role.toUpperCase()}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          GALLERY
      ══════════════════════════════════════════════════════════════ */}
      <Box id="gallery" sx={{ bgcolor: '#0f0f0f', py: { xs: 8, md: 12 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Box textAlign="center" mb={7} data-reveal>
            <GoldLabel>GALLERY</GoldLabel>
            <SectionHeading center>Visual Feast</SectionHeading>
          </Box>
          {/* Responsive gallery grid */}
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: '2fr 1fr 1fr' }, gridTemplateRows: { md: '260px 260px' } }}>
            {GALLERY.map((src, i) => (
              <Box key={i}
                // @ts-ignore
                data-reveal="scale" data-delay={String(i * 80)}
                sx={{
                  gridColumn: i === 0 ? { md: '1 / 2', xs: '1 / 3' } : 'auto',
                  gridRow: i === 0 ? { md: '1 / 3' } : 'auto',
                  height: { xs: 160, md: 'auto' },
                  overflow: 'hidden', position: 'relative',
                  '&:hover .gi': { transform: 'scale(1.07)' },
                  '&:hover .go': { opacity: 1 },
                }}>
                <Box className="gi" sx={{ width: '100%', height: '100%', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'transform 0.6s ease' }} />
                <Box className="go" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(201,169,110,0.18)', opacity: 0, transition: 'opacity 0.4s ease' }} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{
        position: 'relative',
        py: { xs: 10, md: 16 },
        overflow: 'hidden',
        // The background is on a pseudo-element so we can use position:fixed trick
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-30%',   // oversized so it doesn't clip during scroll
          backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(10,10,10,0.72)',
          zIndex: 1,
        },
      }}>
        <Container maxWidth={false} sx={{ position: 'relative', zIndex: 2, textAlign: 'center', px: { xs: 3, sm: 5, md: 8 }, maxWidth: 680, mx: 'auto' }}>
          <Box data-reveal>
            <GoldLabel>RESERVE NOW</GoldLabel>
            <SectionHeading center>Your Room is Waiting</SectionHeading>
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 2, mb: 5, fontFamily: 'sans-serif', lineHeight: 1.9, fontSize: '0.92rem' }}>
              Book your stay at Grand Dima Hotel and let us craft an unforgettable experience tailored just for you.
            </Typography>
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button onClick={() => scrollTo('rooms')} sx={{ bgcolor: gold, color: dark, borderRadius: 0, px: 5, py: 1.8, fontSize: '0.78rem', letterSpacing: 3, fontWeight: 700, fontFamily: 'sans-serif', '&:hover': { bgcolor: '#b8935a' } }}>BOOK A ROOM</Button>
              <Button href="tel:+251911000000" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 0, px: 5, py: 1.8, fontSize: '0.78rem', letterSpacing: 3, fontFamily: 'sans-serif', '&:hover': { borderColor: gold, color: gold } }}>CALL US NOW</Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════════════ */}
      <Box id="contact" sx={{ bgcolor: dark, py: { xs: 8, md: 12 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Grid container spacing={{ xs: 6, md: 10 }}>
            <Grid item xs={12} md={5}
              // @ts-ignore
              data-reveal="left"
            >
              <GoldLabel>GET IN TOUCH</GoldLabel>
              <SectionHeading>Contact Us</SectionHeading>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', lineHeight: 1.95, mt: 2.5, mb: 5, fontSize: '0.92rem' }}>
                Our team is available around the clock to assist with reservations, special requests, and any questions you may have.
              </Typography>
              {[
                { icon: <LocationIcon />, label: 'ADDRESS', value: 'Shegger City, Sebeta Sub-city, Ethiopia' },
                { icon: <PhoneIcon />, label: 'PHONE', value: '+251 911 000 000 · Available 24/7' },
                { icon: <EmailIcon />, label: 'EMAIL', value: 'info@granddima.com' },
              ].map((item) => (
                <Box key={item.label} display="flex" gap={2.5} alignItems="flex-start" mb={3.5}>
                  <Box sx={{ color: gold, mt: 0.2, '& .MuiSvgIcon-root': { fontSize: 20 } }}>{item.icon}</Box>
                  <Box>
                    <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 2.5, fontFamily: 'sans-serif', mb: 0.4 }}>{item.label}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontFamily: 'sans-serif', fontSize: '0.88rem' }}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={7}>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }} onSubmit={(e) => { e.preventDefault(); toast.success('Message sent! We\'ll be in touch shortly.'); }}>
                <Grid container spacing={2.5}>
                  {[{ label: 'FULL NAME', type: 'text' }, { label: 'EMAIL ADDRESS', type: 'email' }].map((f) => (
                    <Grid item xs={12} sm={6} key={f.label}>
                      <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 2.5, mb: 1, fontFamily: 'sans-serif' }}>{f.label}</Typography>
                      <TextField type={f.type} fullWidth variant="standard"
                        InputProps={{ disableUnderline: false, sx: { color: 'white', '&::before': { borderColor: 'rgba(255,255,255,0.15)' }, '&::after': { borderColor: gold } } }}
                        sx={{ '& input': { color: 'white', pb: 1, fontSize: '0.9rem' } }} />
                    </Grid>
                  ))}
                </Grid>
                <Box>
                  <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 2.5, mb: 1, fontFamily: 'sans-serif' }}>MESSAGE</Typography>
                  <TextField multiline rows={4} fullWidth variant="standard"
                    InputProps={{ disableUnderline: false, sx: { color: 'white', '&::before': { borderColor: 'rgba(255,255,255,0.15)' }, '&::after': { borderColor: gold } } }}
                    sx={{ '& textarea': { color: 'white', fontSize: '0.9rem' } }} />
                </Box>
                <Button type="submit" sx={{ bgcolor: gold, color: dark, borderRadius: 0, py: 1.8, alignSelf: 'flex-start', px: 5, fontSize: '0.72rem', letterSpacing: 3, fontWeight: 700, fontFamily: 'sans-serif', '&:hover': { bgcolor: '#b8935a' } }}>
                  SEND MESSAGE
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#050505', py: { xs: 6, md: 8 }, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth={false} sx={{ px: { xs: 3, sm: 5, md: 8, xl: 14 } }}>
          <Grid container spacing={4} mb={5}>
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <Box sx={{ width: 38, height: 38, borderRadius: '50%', border: `1px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: gold, fontWeight: 700, fontFamily: 'serif', fontSize: '1rem' }}>G</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: 'white', fontWeight: 700, letterSpacing: 2, fontFamily: 'serif', lineHeight: 1, fontSize: '0.9rem' }}>GRAND DIMA</Typography>
                  <Typography sx={{ color: gold, fontSize: '0.52rem', letterSpacing: 4 }}>HOTEL · SHEGGER</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.83rem', fontFamily: 'sans-serif', lineHeight: 1.85 }}>
                Shegger City, Sebeta Sub-city, Ethiopia. Where timeless elegance meets modern luxury.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 3, mb: 2.5, fontFamily: 'sans-serif' }}>NAVIGATION</Typography>
              {NAV.map((link) => (
                <Typography key={link} onClick={() => scrollTo(link.toLowerCase())} sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', fontFamily: 'sans-serif', mb: 1.25, cursor: 'pointer', transition: 'color 0.3s', '&:hover': { color: gold } }}>
                  {link}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 3, mb: 2.5, fontFamily: 'sans-serif' }}>CONTACT</Typography>
              {[
                { icon: <LocationIcon sx={{ fontSize: 13 }} />, text: 'Shegger City, Sebeta Sub-city' },
                { icon: <PhoneIcon sx={{ fontSize: 13 }} />, text: '+251 911 000 000' },
                { icon: <EmailIcon sx={{ fontSize: 13 }} />, text: 'info@granddima.com' },
              ].map((item, i) => (
                <Box key={i} display="flex" alignItems="center" gap={1} mb={1.25}>
                  <Box sx={{ color: gold }}>{item.icon}</Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>{item.text}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 3, mb: 2.5, fontFamily: 'sans-serif' }}>HOURS</Typography>
              {[['Mon – Fri', '24 Hours'], ['Saturday', '24 Hours'], ['Sunday', '24 Hours']].map(([day, hrs]) => (
                <Box key={day} display="flex" justifyContent="space-between" mb={1.25}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>{day}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontFamily: 'sans-serif' }}>{hrs}</Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 3 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontFamily: 'sans-serif' }}>© 2026 Grand Dima Hotel. All rights reserved.</Typography>
            <Button onClick={() => navigate('/login')} sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.68rem', letterSpacing: 2.5, fontFamily: 'sans-serif', '&:hover': { color: gold } }}>STAFF LOGIN</Button>
          </Box>
        </Container>
      </Box>

      {/* ══════════════════════════════════════════════════════════════
          BOOKING DIALOG
      ══════════════════════════════════════════════════════════════ */}
      <Dialog open={bookingOpen} onClose={() => setBookingOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: '#111', color: 'white', borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)', m: { xs: 2, sm: 4 } } }}>
        {selectedRoom && (
          <>
            <DialogTitle sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography sx={{ color: gold, fontSize: '0.6rem', letterSpacing: 3, fontFamily: 'sans-serif', mb: 0.5 }}>BOOKING SUMMARY</Typography>
                  <Typography sx={{ color: 'white', fontFamily: 'serif', fontSize: '1.3rem', fontWeight: 600 }}>{selectedRoom.roomType.name}</Typography>
                </Box>
                <IconButton onClick={() => setBookingOpen(false)} sx={{ color: 'rgba(255,255,255,0.35)', '&:hover': { color: 'white' } }}><CloseIcon /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ height: 180, backgroundImage: `url(${getRoomImage(selectedRoom.roomType.name)})`, backgroundSize: 'cover', backgroundPosition: 'center', mb: 3 }} />
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', mb: 2.5 }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', fontSize: '0.82rem' }}>
                  {selectedRoom.roomType.bedConfiguration} · {selectedRoom.roomType.maxOccupancy} guests · {selectedRoom.roomType.size} sq ft
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', fontSize: '0.78rem', mt: 0.5, fontStyle: 'italic' }}>
                  {selectedRoom.roomType.description}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)', mb: 2.5 }} />
              <Box display="flex" flexDirection="column" gap={1.5}>
                {[
                  { label: '1 night × ETB ' + selectedRoom.pricing.baseRate.toLocaleString(), val: `ETB ${selectedRoom.pricing.baseRate.toLocaleString()}` },
                  { label: 'Taxes & fees (10%)', val: `ETB ${(selectedRoom.pricing.baseRate * 0.1).toLocaleString()}` },
                  { label: 'Service fee', val: 'ETB 200' },
                ].map((row) => (
                  <Box key={row.label} display="flex" justifyContent="space-between">
                    <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>{row.label}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>{row.val}</Typography>
                  </Box>
                ))}
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ color: 'white', fontFamily: 'serif', fontWeight: 600, fontSize: '1rem' }}>Total</Typography>
                  <Typography sx={{ color: gold, fontFamily: 'serif', fontWeight: 700, fontSize: '1.1rem' }}>ETB {(selectedRoom.pricing.baseRate * calcNights() * 1.1 + 200).toLocaleString()}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.07)', gap: 1.5 }}>
              <Button onClick={() => setBookingOpen(false)} sx={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', fontSize: '0.72rem', letterSpacing: 2 }}>CANCEL</Button>
              <Button onClick={() => { toast('Please login to complete your booking', { icon: '🔐' }); navigate('/login', { state: { bookingInfo: { roomId: selectedRoom._id } } }); }}
                sx={{ bgcolor: gold, color: dark, borderRadius: 0, px: 4, py: 1.5, fontSize: '0.72rem', letterSpacing: 2, fontWeight: 700, fontFamily: 'sans-serif', '&:hover': { bgcolor: '#b8935a' } }}>
                PROCEED TO BOOK
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

    </Box>
  );
};
