import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { t } from '../../utils/i18n';
import useSpeech from '../../hooks/useSpeech';
import './Navbar.css';

// ── Color presets ────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { name: 'Indigo', primary: '#4F46E5', light: '#818CF8', accent: '#F97316' },
  { name: 'Purple', primary: '#7C3AED', light: '#A78BFA', accent: '#F97316' },
  { name: 'Blue',   primary: '#2563EB', light: '#60A5FA', accent: '#F97316' },
  { name: 'Teal',   primary: '#0D9488', light: '#2DD4BF', accent: '#F97316' },
  { name: 'Rose',   primary: '#DB2777', light: '#F472B6', accent: '#FBBF24' },
  { name: 'Amber',  primary: '#D97706', light: '#FBBF24', accent: '#7C3AED' },
];

function applyColor(preset) {
  const root = document.documentElement;
  root.style.setProperty('--color-brand-primary',   preset.primary);
  root.style.setProperty('--color-brand-secondary', preset.light);
  const styleId = 'yjs-color-override';
  let el = document.getElementById(styleId);
  if (!el) { el = document.createElement('style'); el.id = styleId; document.head.appendChild(el); }
  el.textContent = `
    .btn-primary, .btn.btn-primary {
      background: linear-gradient(135deg, ${preset.primary}, ${preset.light}) !important;
    }
    .nav-cta { background: linear-gradient(135deg, ${preset.primary}, ${preset.light}) !important; }
    .nav-link.active { color: ${preset.primary} !important; }
    .nav-link.active::after { background: ${preset.primary} !important; }
    ::-webkit-scrollbar-thumb { background: ${preset.primary}80 !important; }
    ::-webkit-scrollbar-thumb:hover { background: ${preset.primary} !important; }
  `;
}

const Navbar = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { addToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColor, setActiveColor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yjs-color')) || COLOR_PRESETS[0]; }
    catch { return COLOR_PRESETS[0]; }
  });
  const colorPickerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { speak, stop, isSpeaking, supported: speechSupported } = useSpeech();

  // Apply saved color on mount
  useEffect(() => { applyColor(activeColor); }, []);

  useEffect(() => {
    return () => stop();
  }, [stop, location.pathname]); // Stop speaking if path changes

  useEffect(() => {
    // Auto-greet user on the very first interaction (click) on the site, once per session
    const alreadyGreeted = sessionStorage.getItem('yojanasetu-greeted');
    if (alreadyGreeted) return;

    const handleFirstClick = () => {
      const welcomeText = language === 'hi'
        ? 'योजनासेतु में आपका स्वागत है। योजनासेतु भारत सरकार की कल्याणकारी योजनाओं को खोजने का एक सरल डिजिटल माध्यम है। वर्तमान में हमारे डेटाबेस में छप्पन सक्रिय योजनाएं उपलब्ध हैं। आप इन योजनाओं को श्रेणी के अनुसार देख सकते हैं, या फिर पात्रता जांचने के लिए हमारे एआई स्मार्ट मैच का उपयोग कर सकते हैं। धन्यवाद!'
        : 'Welcome to YojanaSetu. YojanaSetu is a simple digital bridge to discover welfare schemes offered by the government of India. Currently, we have fifty-six active schemes in our database. You can browse these schemes by category, or use our AI Smart Match to check your eligibility. Thank you!';
      
      speak(welcomeText);
      sessionStorage.setItem('yojanasetu-greeted', 'true');
      
      document.removeEventListener('click', handleFirstClick);
    };

    document.addEventListener('click', handleFirstClick);
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, [speak, language]);

  const handleVoiceGuide = () => {
    if (isSpeaking) {
      stop();
      return;
    }

    const { pathname } = location;
    const isHi = language === 'hi';
    let text = '';

    if (pathname === '/') {
      text = isHi
        ? 'योजनासेतु होमपेज पर आपका स्वागत है। यहां आप विभिन्न श्रेणियों में छप्पन कल्याणकारी योजनाएं देख सकते हैं या पात्रता जांचने के लिए स्मार्ट मैच का उपयोग कर सकते हैं। धन्यवाद!'
        : 'Welcome to YojanaSetu homepage. Here you can browse fifty-six welfare schemes across categories or use the Smart Match to check your eligibility. Thank you!';
    } else if (pathname === '/schemes') {
      text = isHi
        ? 'आप सभी सरकारी योजनाओं को ब्राउज़ कर रहे हैं। आप खोज बॉक्स का उपयोग करके योजनाएं खोज सकते हैं या श्रेणियों के फिल्टर चिप्स पर क्लिक कर सकते हैं।'
        : 'You are browsing all government schemes. You can search schemes using the search box or filter them by clicking on the category chips.';
    } else if (pathname.startsWith('/schemes/')) {
      text = isHi
        ? 'आप योजना का विवरण देख रहे हैं। योजना का नाम, पात्रता और आवेदन प्रक्रिया जानने के लिए सुनें बटन पर क्लिक करें।'
        : 'You are viewing scheme details. Click on the Listen button to hear the name, eligibility and application process.';
    } else if (pathname === '/smart-match') {
      text = isHi
        ? 'स्मार्ट मैच में आपका स्वागत है। आप एआई वॉयस मैच का उपयोग करके बोलकर अपनी पसंदीदा योजनाएं ढूंढ सकते हैं या फॉर्म भर सकते हैं।'
        : 'Welcome to Smart Match. You can use the AI Voice Match to speak your profile or fill out the form step-by-step.';
    } else if (pathname === '/about') {
      text = isHi
        ? 'यह हमारे बारे में पेज है। योजनासेतु भारतीय नागरिकों को सरकारी योजनाओं तक पहुंचाने का एक माध्यम है।'
        : 'This is the about page. YojanaSetu is a bridge connecting Indian citizens with government welfare schemes.';
    } else {
      text = isHi
        ? 'योजनासेतु में आपका स्वागत है। आप इस पोर्टल पर अपनी सरकारी योजनाएं खोज सकते हैं।'
        : 'Welcome to YojanaSetu. You can search for your government schemes on this portal.';
    }

    speak(text);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToast(language === 'hi' ? 'योजनाएं खोजी जा रही हैं...' : 'Searching schemes...', 'info');
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: t(language, 'nav.home'), end: true },
    { to: '/schemes', label: t(language, 'nav.schemes') },
    { to: '/smart-match', label: t(language, 'nav.smartMatch') },
    { to: '/about', label: t(language, 'nav.about') }
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
            <div className="logo-icon">
              <span>🏛</span>
            </div>
            <div className="logo-text">
              <span className="logo-name">YojanaSetu</span>
              <span className="logo-tagline">योजनासेतु</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="navbar-links">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <button
              className="nav-icon-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search schemes"
              id="nav-search-btn"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Language Toggle */}
            <button
              className="nav-lang-btn"
              onClick={toggleLanguage}
              aria-label="Switch language"
              id="nav-lang-toggle"
            >
              {language === 'en' ? 'हि' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
              className="nav-theme-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              id="nav-theme-toggle"
            >
              <div className={`theme-icon-wrapper ${isDark ? 'dark' : 'light'}`}>
                {isDark ? (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M18.364 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                )}
              </div>
            </button>

            {/* AI Assistant in Navbar */}
            {speechSupported && (
              <button
                className={`nav-icon-btn nav-ai-assistant-btn ${isSpeaking ? 'speaking' : ''}`}
                onClick={handleVoiceGuide}
                aria-label="AI Voice Guide"
                title={language === 'hi' ? 'एआई गाइड' : 'AI Voice Guide'}
                id="nav-ai-guide-btn"
              >
                {isSpeaking ? (
                  <div className="nav-voice-waves">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <span style={{ fontSize: '1.25rem' }}>🤖</span>
                )}
              </button>
            )}

            {/* Removed Color Picker and Find My Schemes */}

            {/* Mobile Hamburger */}
            <button
              className={`hamburger ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
              id="hamburger-btn"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Search Bar (dropdown) */}
        <div className={`search-dropdown ${searchOpen ? 'open' : ''}`}>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="input search-input-field"
              placeholder={t(language, 'nav.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus={searchOpen}
              id="navbar-search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm search-submit" id="search-submit-btn">
              {t(language, 'common.search')}
            </button>
          </form>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
