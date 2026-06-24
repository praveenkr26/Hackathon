import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import { schemeAPI } from '../services/api';
import SchemeCard from '../components/ui/SchemeCard';
import './Home.css';

const CATEGORY_INFO = [
  { key: 'education', icon: '🎓', color: '#3b82f6' },
  { key: 'health', icon: '🏥', color: '#10b981' },
  { key: 'agriculture', icon: '🌾', color: '#f59e0b' },
  { key: 'housing', icon: '🏠', color: '#8b5cf6' },
  { key: 'employment', icon: '💼', color: '#06b6d4' },
  { key: 'women-empowerment', icon: '👩', color: '#ec4899' },
  { key: 'skill-development', icon: '⚡', color: '#f97316' },
  { key: 'financial-inclusion', icon: '💳', color: '#84cc16' }
];

const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedStories, setSavedStories] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('yojanasetu-saved-stories');
      if (stored) {
        setSavedStories(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDeleteStory = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    const updated = savedStories.filter(s => s.id !== id);
    setSavedStories(updated);
    localStorage.setItem('yojanasetu-saved-stories', JSON.stringify(updated));
  };

  const handleViewStory = (story) => {
    navigate('/smart-match', { state: { profile: story.profile } });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [schemesRes, statsRes] = await Promise.all([
          schemeAPI.getAll({ featured: true, limit: 6 }).catch(() => ({ data: [] })),
          schemeAPI.getStats().catch(() => null)
        ]);
        setFeaturedSchemes(schemesRes?.data || []);
        setStats(statsRes?.data || null);
      } catch {
        setFeaturedSchemes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  return (
    <div className="home-page page-enter">

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="hero-section">
        {/* Animated background blobs */}
        <div className="hero-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        <div className="container hero-content">
          {/* Tagline Badge */}
          <div className="hero-badge animate-fade-in-down">
            <span className="hero-badge-dot"></span>
            {t(language, 'hero.tagline')}
          </div>

          {/* Heading */}
          <h1 className="hero-title animate-fade-in-up delay-100">
            {t(language, 'hero.title')}{' '}
            <span className="text-gradient">{t(language, 'hero.titleAccent')}</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle animate-fade-in-up delay-200">
            {t(language, 'hero.subtitle')}
          </p>

          {/* Search Bar */}
          <form className="hero-search animate-fade-in-up delay-300" onSubmit={handleSearch}>
            <div className="hero-search-inner">
              <svg className="search-icon-hero" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(language, 'nav.searchPlaceholder')}
                className="hero-search-input"
                id="hero-search-input"
              />
              <button type="submit" className="btn btn-primary hero-search-btn" id="hero-search-submit">
                {t(language, 'common.search')}
              </button>
            </div>
          </form>

          {/* CTA Buttons */}
          <div className="hero-cta animate-fade-in-up delay-400">
            <Link to="/smart-match" className="btn btn-primary btn-xl" id="hero-cta-match">
              🎯 {t(language, 'hero.ctaPrimary')}
            </Link>
            <Link to="/schemes" className="btn btn-secondary btn-xl" id="hero-cta-browse">
              {t(language, 'hero.ctaSecondary')}
            </Link>
          </div>

          {/* Trust Indicator */}
          <p className="hero-trust animate-fade-in delay-500">
            <span className="trust-avatars">
              {['🧑', '👩', '👨', '👴', '👩‍🌾'].map((e, i) => (
                <span key={i} className="trust-avatar">{e}</span>
              ))}
            </span>
            {t(language, 'hero.trustText')}
          </p>
        </div>

        {/* Floating Cards */}
        <div className="hero-floating-cards">
          <div className="floating-card fc-1 animate-float">
            <span className="fc-icon">🌾</span>
            <div>
              <div className="fc-title">PM Kisan</div>
              <div className="fc-amount">₹6,000/yr</div>
            </div>
          </div>
          <div className="floating-card fc-2 animate-float" style={{ animationDelay: '2s' }}>
            <span className="fc-icon">🏥</span>
            <div>
              <div className="fc-title">Ayushman Bharat</div>
              <div className="fc-amount">₹5L cover</div>
            </div>
          </div>
          <div className="floating-card fc-3 animate-float" style={{ animationDelay: '4s' }}>
            <span className="fc-icon">🎓</span>
            <div>
              <div className="fc-title">Scholarships</div>
              <div className="fc-amount">₹36K/yr</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { icon: '📋', value: stats?.totalSchemes || 500, suffix: '+', label: t(language, 'stats.schemes') },
              { icon: '🏷', value: stats?.categories || 12, suffix: '', label: t(language, 'stats.categories') },
              { icon: '👥', value: 10, suffix: ' Cr+', label: t(language, 'stats.beneficiaries') },
              { icon: '🗺', value: 36, suffix: '', label: t(language, 'stats.states') }
            ].map((stat, i) => (
              <div key={i} className="stat-item animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="stat-icon-wrap">{stat.icon}</div>
                <div className="stat-value">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Categories Section ───────────────────────────────── */}
      <section className="categories-section section-padding">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <div className="section-pill">Browse by Category</div>
            <h2 className="section-title">{t(language, 'categories.title')}</h2>
            <p className="section-subtitle">{t(language, 'categories.subtitle')}</p>
          </div>

          <div className="categories-grid">
            {CATEGORY_INFO.map((cat, i) => (
              <Link
                key={cat.key}
                to={`/schemes?category=${cat.key}`}
                className="category-card animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms`, '--cat-color': cat.color }}
                id={`category-${cat.key}`}
              >
                <div className="cat-icon-wrap">
                  <span className="cat-icon">{cat.icon}</span>
                </div>
                <span className="cat-name">{t(language, `categories.${cat.key}`)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Saved Stories Section ────────────────────────────── */}
      {savedStories.length > 0 && (
        <section className="saved-stories-section section-padding">
          <div className="container">
            <div className="section-header animate-fade-in-up">
              <div className="section-pill">💾 {language === 'hi' ? 'मेरी खोज' : 'Saved Matches'}</div>
              <h2 className="section-title">
                {language === 'hi' ? 'सहेजे गए स्मार्ट मैच' : 'Your Saved Match Stories'}
              </h2>
              <p className="section-subtitle">
                {language === 'hi'
                  ? 'अपने पुराने खोज परिणामों को एक क्लिक में दोबारा देखें'
                  : 'Quickly access your saved query profiles and match results'}
              </p>
            </div>

            <div className="stories-grid animate-fade-in-up">
              {savedStories.map((story) => (
                <div key={story.id} className="story-card hover-lift">
                  <div className="story-card-header">
                    <span className="story-time">
                      🗓 {new Date(story.timestamp).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <button
                      className="delete-story-btn"
                      onClick={(e) => handleDeleteStory(story.id, e)}
                      title="Delete Match Story"
                      id={`delete-story-${story.id}`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="story-profile-summary">
                    <div className="story-profile-item">
                      <span>👤</span> {story.profile.age} Yrs
                    </div>
                    <div className="story-profile-item">
                      <span>🚻</span> {t(language, `match.${story.profile.gender}`)}
                    </div>
                    {story.profile.income && (
                      <div className="story-profile-item">
                        <span>💰</span> ₹{parseInt(story.profile.income).toLocaleString()}
                      </div>
                    )}
                    {story.profile.occupation && (
                      <div className="story-profile-item">
                        <span>💼</span> {t(language, `match.${story.profile.occupation}`)}
                      </div>
                    )}
                    {story.profile.state && (
                      <div className="story-profile-item">
                        <span>🗺</span> {story.profile.state}
                      </div>
                    )}
                  </div>

                  <div className="story-matches-count">
                    🎯 <strong>{story.matchCount}</strong> {language === 'hi' ? 'योजनाएं मेल खाती हैं' : 'Schemes Matched'}
                  </div>

                  <button
                    className="btn btn-primary btn-sm story-view-btn"
                    onClick={() => handleViewStory(story)}
                    id={`view-story-${story.id}`}
                  >
                    🔍 {language === 'hi' ? 'मिलान परिणाम देखें' : 'View Matches'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Featured Schemes ─────────────────────────────────── */}
      <section className="featured-section section-padding">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <div className="section-pill">⭐ Featured</div>
            <h2 className="section-title">Popular Welfare Schemes</h2>
            <p className="section-subtitle">Discover the most accessed government welfare programs</p>
          </div>

          {loading ? (
            <div className="schemes-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="scheme-skeleton">
                  <div className="skeleton" style={{ height: '80px', borderRadius: '12px 12px 0 0' }} />
                  <div style={{ padding: '1rem' }}>
                    <div className="skeleton" style={{ height: '14px', marginBottom: '0.5rem', width: '60%' }} />
                    <div className="skeleton" style={{ height: '18px', marginBottom: '0.75rem' }} />
                    <div className="skeleton" style={{ height: '12px', marginBottom: '0.5rem', width: '80%' }} />
                    <div className="skeleton" style={{ height: '12px', width: '70%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredSchemes.length > 0 ? (
            <div className="schemes-grid">
              {featuredSchemes.map((scheme, i) => (
                <SchemeCard key={scheme._id} scheme={scheme} index={i} />
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <div className="no-data-icon">📋</div>
              <h3>Start the Backend</h3>
              <p>Run <code>npm run dev</code> in the backend folder to load real scheme data.</p>
              <Link to="/schemes" className="btn btn-primary">Browse Demo Schemes</Link>
            </div>
          )}

          <div className="section-cta animate-fade-in-up">
            <Link to="/schemes" className="btn btn-secondary btn-lg" id="view-all-schemes-btn">
              View All Schemes →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="how-section section-padding">
        <div className="container">
          <div className="section-header animate-fade-in-up">
            <div className="section-pill">🚀 Quick & Easy</div>
            <h2 className="section-title">How YojanaSetu Works</h2>
            <p className="section-subtitle">Get matched with the right welfare schemes in 3 simple steps</p>
          </div>

          <div className="steps-grid">
            {[
              { step:'01', icon:'📝', title:'Share Your Profile',   desc:'Tell us your age, income, occupation and state. Takes less than 2 minutes.' },
              null,
              { step:'02', icon:'🤖', title:'AI Matches Schemes',   desc:'Our smart algorithm instantly matches you with 500+ government schemes.' },
              null,
              { step:'03', icon:'🎯', title:'Apply & Benefit',      desc:'Get direct apply links and official documents for every matched scheme.' },
            ].map((item, i) =>
              item ? (
                <div key={i} className="step-card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="step-number">{item.step}</div>
                  <div className="step-icon-wrap">{item.icon}</div>
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-desc">{item.desc}</p>
                </div>
              ) : (
                <div key={i} className="step-connector">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              )
            )}
          </div>

          <div className="how-cta animate-fade-in-up">
            <Link to="/smart-match" className="btn btn-primary btn-xl" id="how-cta-btn">
              🎯 {t(language, 'hero.ctaPrimary')}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Banner CTA ───────────────────────────────────────── */}
      <section className="banner-section">
        <div className="container banner-inner">
          <div className="banner-content animate-fade-in-left">
            <h2 className="banner-title">Ready to Find Your Benefits?</h2>
            <p className="banner-subtitle">
              Join millions of Indians who discovered government schemes they were unaware of.
              No registration required.
            </p>
            <Link to="/smart-match" className="btn btn-primary btn-xl" id="banner-cta-btn">
              Start Free — No Signup Needed
            </Link>
          </div>
          <div className="banner-illustration animate-fade-in-right">
            <div className="banner-emoji-grid">
              {['🏥', '🎓', '🌾', '🏠', '💳', '⚡', '👩', '💼'].map((e, i) => (
                <div key={i} className="banner-emoji-item" style={{ animationDelay: `${i * 100}ms` }}>
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;
