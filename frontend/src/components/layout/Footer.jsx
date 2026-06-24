import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';
import './Footer.css';

const Footer = () => {
  const { language } = useLanguage();

  const categories = [
    'education', 'health', 'agriculture', 'housing',
    'employment', 'women-empowerment', 'skill-development'
  ];

  const quickLinks = [
    { to: '/', label: t(language, 'nav.home') },
    { to: '/schemes', label: t(language, 'nav.schemes') },
    { to: '/smart-match', label: t(language, 'nav.smartMatch') },
    { to: '/about', label: t(language, 'nav.about') }
  ];

  return (
    <footer className="footer">
      <div className="footer-waves">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--bg-secondary)"/>
        </svg>
      </div>

      <div className="footer-body">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">🏛</div>
              <div>
                <div className="footer-logo-name">YojanaSetu</div>
                <div className="footer-logo-hindi">योजनासेतु</div>
              </div>
            </Link>
            <p className="footer-tagline">{t(language, 'footer.tagline')}</p>

            {/* Social Links */}
            <div className="footer-social">
              {[
                { icon: '𝕏', label: 'Twitter', href: '#' },
                { icon: 'in', label: 'LinkedIn', href: '#' },
                { icon: 'f', label: 'Facebook', href: '#' }
              ].map(s => (
                <a key={s.label} href={s.href} className="social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t(language, 'footer.quickLinks')}</h4>
            <ul className="footer-links">
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t(language, 'footer.categories')}</h4>
            <ul className="footer-links">
              {categories.slice(0, 6).map(cat => (
                <li key={cat}>
                  <Link to={`/schemes?category=${cat}`} className="footer-link">
                    {t(language, `categories.${cat}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">{t(language, 'footer.contact')}</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <div className="contact-label">{t(language, 'footer.helpline')}</div>
                  <a href="tel:14555" className="contact-value">14555</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <div className="contact-label">{t(language, 'footer.email')}</div>
                  <a href="mailto:help@yojanasetu.in" className="contact-value">help@yojanasetu.in</a>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <p className="footer-copyright">
              {t(language, 'footer.copyright')} | Made by <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Praveen Kumar Pandit (Navgurukul)</span>
            </p>
            <p className="footer-disclaimer">
              {t(language, 'footer.disclaimer')}
            </p>
            <div className="footer-badges">
              <span className="badge badge-success">🔒 Secure</span>
              <span className="badge badge-info">🇮🇳 Made in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
