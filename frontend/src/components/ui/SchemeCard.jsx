import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';
import './SchemeCard.css';

const CATEGORY_CONFIG = {
  education: { icon: '🎓', gradient: 'var(--gradient-cool)' },
  health: { icon: '🏥', gradient: 'var(--gradient-green)' },
  agriculture: { icon: '🌾', gradient: 'var(--gradient-warm)' },
  housing: { icon: '🏠', gradient: 'var(--gradient-purple)' },
  employment: { icon: '💼', gradient: 'var(--gradient-cool)' },
  'social-welfare': { icon: '🤝', gradient: 'var(--gradient-pink)' },
  'women-empowerment': { icon: '👩', gradient: 'var(--gradient-pink)' },
  'skill-development': { icon: '⚡', gradient: 'var(--gradient-warm)' },
  'financial-inclusion': { icon: '💳', gradient: 'var(--gradient-green)' },
  'senior-citizen': { icon: '👴', gradient: 'var(--gradient-purple)' },
  disability: { icon: '♿', gradient: 'var(--gradient-cool)' },
  'tribal-welfare': { icon: '🌿', gradient: 'var(--gradient-green)' }
};

const CATEGORY_IMAGES = {
  education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
  agriculture: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop',
  housing: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop',
  employment: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
  'social-welfare': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
  'women-empowerment': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
  'skill-development': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=600&auto=format&fit=crop',
  'financial-inclusion': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
  'senior-citizen': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  disability: 'https://images.unsplash.com/photo-1531206715517-5c0ba140e2b8?q=80&w=600&auto=format&fit=crop',
  'tribal-welfare': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop'
};

const BENEFIT_TYPE_LABELS = {
  financial: '₹ Financial',
  scholarship: '🎓 Scholarship',
  insurance: '🛡 Insurance',
  employment: '💼 Employment',
  housing: '🏠 Housing',
  healthcare: '🏥 Healthcare',
  education: '📚 Education',
  pension: '💰 Pension',
  loan: '🏦 Loan',
  subsidy: '💸 Subsidy'
};

const formatAmount = (amount) => {
  if (!amount) return null;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

const SchemeCard = ({ scheme, index = 0, showMatchScore, matchScore }) => {
  const { language } = useLanguage();
  const catConfig = CATEGORY_CONFIG[scheme.category] || { icon: '📋', gradient: 'var(--gradient-brand)' };
  const primaryBenefit = scheme.benefits?.[0];

  return (
    <article
      className="scheme-card animate-fade-in-up card"
      style={{ animationDelay: `${Math.min(index * 80, 600)}ms` }}
      aria-label={`Scheme: ${scheme.name}`}
    >
      {/* Header */}
      <div 
        className="scheme-card-header" 
        style={{ 
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${CATEGORY_IMAGES[scheme.category] || CATEGORY_IMAGES['social-welfare']}) center/cover no-repeat` 
        }}
      >
        <div className="scheme-card-icon">{catConfig.icon}</div>
        <div className="scheme-card-header-right">
          {scheme.featured && (
            <span className="badge badge-warning scheme-featured-badge">
              ⭐ {t(language, 'card.featured')}
            </span>
          )}
          <span className={`badge scheme-status-badge ${scheme.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
            {t(language, `card.${scheme.status}`)}
          </span>
        </div>

        {showMatchScore && matchScore !== undefined && (
          <div className="scheme-match-score">
            <div className="match-score-value">{matchScore}%</div>
            <div className="match-score-label">{t(language, 'match.matchScore')}</div>
            <div className="match-score-bar">
              <div className="match-score-fill" style={{ width: `${matchScore}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="scheme-card-body">
        <div className="scheme-category-chip">
          <span>{t(language, `categories.${scheme.category}`)}</span>
        </div>

        <h3 className="scheme-card-title">
          {language === 'hi' && scheme.nameHindi ? scheme.nameHindi : scheme.name}
        </h3>

        <p className="scheme-card-ministry">
          <span className="ministry-icon">🏛</span>
          {scheme.ministry}
        </p>

        <p className="scheme-card-desc">
          {language === 'hi' && scheme.descriptionHindi
            ? scheme.descriptionHindi.substring(0, 110) + (scheme.descriptionHindi.length > 110 ? '...' : '')
            : scheme.description.substring(0, 110) + (scheme.description.length > 110 ? '...' : '')
          }
        </p>

        {/* Benefit Highlight */}
        {primaryBenefit && (
          <div className="scheme-benefit-highlight">
            <span className="benefit-type-label">
              {BENEFIT_TYPE_LABELS[primaryBenefit.type] || primaryBenefit.type}
            </span>
            {primaryBenefit.amount && (
              <span className="benefit-amount">{formatAmount(primaryBenefit.amount)}</span>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="scheme-card-meta">
          {scheme.launchYear && (
            <span className="meta-item">
              📅 {t(language, 'card.since')} {scheme.launchYear}
            </span>
          )}
          {scheme.documents?.length > 0 && (
            <span className="meta-item">
              📄 {scheme.documents.length} {t(language, 'card.documents')}
            </span>
          )}
        </div>

        {/* Tags */}
        {scheme.tags?.length > 0 && (
          <div className="scheme-tags">
            {scheme.tags.slice(0, 3).map(tag => (
              <span key={tag} className="scheme-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="scheme-card-footer">
        <Link
          to={`/schemes/${scheme.id || scheme._id}`}
          className="btn btn-primary btn-sm scheme-btn-primary"
          id={`scheme-detail-${scheme.id || scheme._id}`}
        >
          {t(language, 'card.viewDetails')} →
        </Link>
        {scheme.applicationUrl && (
          <a
            href={scheme.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            id={`scheme-apply-${scheme._id}`}
          >
            {t(language, 'card.applyNow')}
          </a>
        )}
      </div>
    </article>
  );
};

export default SchemeCard;
