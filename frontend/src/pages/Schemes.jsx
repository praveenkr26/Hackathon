import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { schemeAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { t } from '../utils/i18n';
import SchemeCard from '../components/ui/SchemeCard';
import './Schemes.css';

const CATEGORIES = [
  'all', 'education', 'health', 'agriculture', 'housing', 'employment',
  'social-welfare', 'women-empowerment', 'skill-development',
  'financial-inclusion', 'senior-citizen', 'disability', 'tribal-welfare'
];

const Schemes = () => {
  const { language } = useLanguage();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [page, setPage] = useState(1);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category && category !== 'all') params.category = category;

      const res = await schemeAPI.getAll(params);
      setSchemes(res?.data || []);
      setPagination(res?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const params = {};
    if (search) params.search = search;
    if (category !== 'all') params.category = category;
    setSearchParams(params);
    addToast(language === 'hi' ? 'योजनाएं फिल्टर की जा रही हैं...' : 'Filtering schemes...', 'info');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    const params = {};
    if (search) params.search = search;
    if (cat !== 'all') params.category = cat;
    setSearchParams(params);
  };

  return (
    <div className="schemes-page page-enter">
      {/* Header */}
      <div className="schemes-hero">
        <div className="container">
          <div className="schemes-hero-content animate-fade-in-up">
            <h1 className="schemes-hero-title">
              All <span className="text-gradient">Welfare Schemes</span>
            </h1>
            <p className="schemes-hero-subtitle">
              Browse {pagination.total || '500+'} government welfare schemes across all categories
            </p>
          </div>

          {/* Search */}
          <form className="schemes-search animate-fade-in-up delay-100" onSubmit={handleSearch}>
            <div className="schemes-search-inner">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="schemes-search-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="schemes-search-input"
                placeholder={t(language, 'nav.searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                id="schemes-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => { setSearch(''); setPage(1); setSearchParams({}); }}
                  id="clear-search-btn"
                >
                  ✕
                </button>
              )}
              <button type="submit" className="btn btn-primary btn-sm schemes-search-btn" id="schemes-search-submit">
                {t(language, 'common.search')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container schemes-body">
        {/* Category Filters */}
        <div className="category-filters animate-fade-in-up">
          <div className="category-filter-scroll">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
                id={`filter-${cat}`}
              >
                {t(language, cat === 'all' ? 'categories.all' : `categories.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="results-info animate-fade-in">
          {!loading && (
            <p className="results-count">
              {pagination.total > 0 ? (
                <>Showing <strong>{schemes.length}</strong> of <strong>{pagination.total}</strong> schemes</>
              ) : 'No schemes found'}
              {search && <> for "<em>{search}</em>"</>}
            </p>
          )}
          <Link to="/smart-match" className="btn btn-primary btn-sm" id="match-cta-btn">
            🎯 Smart Match
          </Link>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="schemes-grid-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="scheme-skeleton-card">
                <div className="skeleton" style={{ height: '80px', borderRadius: '12px 12px 0 0' }} />
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ height: '12px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '18px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '48px', marginTop: '0.5rem', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="schemes-error">
            <div className="error-icon">⚠️</div>
            <h3>Connection Error</h3>
            <p>Could not connect to the backend server. Make sure the backend is running on port 5000.</p>
            <p className="error-detail">{error}</p>
            <button className="btn btn-primary" onClick={fetchSchemes} id="retry-btn">
              {t(language, 'common.retry')}
            </button>
          </div>
        ) : schemes.length === 0 ? (
          <div className="schemes-empty">
            <div className="empty-icon">🔍</div>
            <h3>No Schemes Found</h3>
            <p>Try a different search term or category.</p>
            <button className="btn btn-primary" onClick={() => { setSearch(''); setCategory('all'); setPage(1); setSearchParams({}); }}>
              {t(language, 'common.clear')} Filters
            </button>
          </div>
        ) : (
          <div className="schemes-grid-full">
            {schemes.map((scheme, i) => (
              <SchemeCard key={scheme._id} scheme={scheme} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="pagination animate-fade-in">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page <= 1}
              id="prev-page-btn"
            >
              ← {t(language, 'common.prev')}
            </button>
            <div className="page-numbers">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                if (pageNum > pagination.pages) return null;
                return (
                  <button
                    key={pageNum}
                    className={`page-num ${pageNum === page ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.pages}
              id="next-page-btn"
            >
              {t(language, 'common.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schemes;
