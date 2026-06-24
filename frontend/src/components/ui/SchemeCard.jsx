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
      <div className="scheme-card-header" style={{ background: catConfig.gradient }}>
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
          to={`/schemes/${scheme._id}`}
          className="btn btn-primary btn-sm scheme-btn-primary"
          id={`scheme-detail-${scheme._id}`}
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
