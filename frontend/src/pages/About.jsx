import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './About.css';

const TRANSLATIONS = {
  hi: {
    heroBadge: '🇮🇳 योजनासेतु के बारे में',
    heroTitle: 'नागरिकों को सरकारी लाभों से जोड़ने वाला',
    heroTitleAccent: 'योजनासेतु',
    heroSub: 'योजनासेतु (YojanaSetu) का अर्थ है "योजनाओं का पुल" — हम भारतीय नागरिकों और उनके लिए बनाई गई सैकड़ों कल्याणकारी सरकारी योजनाओं के बीच की दूरी को कम करते हैं।',
    
    missionTitle: 'हमारा लक्ष्य',
    missionDesc: 'तकनीक और एआई (AI) के माध्यम से यह सुनिश्चित करना कि हर भारतीय नागरिक उन सभी सरकारी कल्याणकारी योजनाओं को खोज और प्राप्त कर सके जिसके वे हकदार हैं।',
    
    visionTitle: 'हमारा दृष्टिकोण',
    visionDesc: 'एक डिजिटल रूप से सशक्त भारत, जहां कोई भी पात्र नागरिक जागरूकता या जानकारी के अभाव में सरकारी लाभों से वंचित न रहे।',
    
    whyTitle: 'हमने इसे क्यों बनाया',
    whyDesc: '1000+ से अधिक सरकारी योजनाएं मौजूद हैं, फिर भी लोगों में जागरूकता बहुत कम है। हम एआई का उपयोग करके नागरिकों को 2 मिनट से भी कम समय में योजनाओं से मिलाते हैं। बिल्कुल मुफ्त।',
    
    statSchemes: 'योजनाएं इंडेक्स्ड',
    statMatching: 'एआई-संचालित मिलान',
    statLanguages: 'भाषाएं',
    statFree: 'हमेशा और पूरी तरह मुफ्त',
    
    diffTitle: 'योजनासेतु को क्या अलग बनाता है?',
    
    diffItems: [
      { title: 'एआई-संचालित मिलान', desc: 'हमारा स्मार्ट एल्गोरिदम कुछ ही सेकंड में 500+ योजनाओं के साथ आपके प्रोफाइल का मिलान करता है।' },
      { title: 'द्विभाषी सहायता', desc: 'पूरी तरह से हिंदी और अंग्रेजी में उपलब्ध। जल्द ही और अधिक भाषाएं जोड़ी जाएंगी।' },
      { title: 'गोपनीयता सर्वोपरि', desc: 'किसी पंजीकरण की आवश्यकता नहीं है। हम आपकी कोई भी व्यक्तिगत जानकारी कभी संग्रहीत नहीं करते हैं।' },
      { title: 'मोबाइल अनुकूल', desc: 'स्मार्टफोन, टैबलेट और डेस्कटॉप कंप्यूटर पर पूरी तरह से काम करता है।' },
      { title: 'तेज और मुफ्त', desc: '2 मिनट से कम समय में परिणाम। कोई छिपा हुआ शुल्क नहीं, कभी भी।' },
      { title: 'सटीक पात्रता', desc: 'सटीक योजना सिफारिशें सुनिश्चित करने के लिए विस्तृत पात्रता मानदंड।' }
    ],
    
    techTitle: 'आधुनिक तकनीक से निर्मित',
    
    techItems: [
      { name: 'React 18', desc: 'प्रोटोटाइप' },
      { name: 'Vite', desc: 'बिल्ड टूल' },
      { name: 'Node.js', desc: 'रनटाइम' },
      { name: 'Express', desc: 'एपीआई' },
      { name: 'MongoDB', desc: 'डेटाबेस' },
      { name: 'Gemini AI', desc: 'एआई मॉडल' }
    ],
    
    ctaTitle: 'अपने सरकारी लाभों को खोजना शुरू करें',
    ctaSub: '2 मिनट से भी कम समय लगता है। किसी साइनअप की आवश्यकता नहीं है।',
    ctaPrimaryBtn: '🎯 मेरी योजनाएं खोजें',
    ctaSecondaryBtn: 'सभी योजनाएं देखें'
  },
  en: {
    heroBadge: '🇮🇳 About YojanaSetu',
    heroTitle: 'Bridging Citizens with',
    heroTitleAccent: 'Government Benefits',
    heroSub: 'YojanaSetu (योजनासेतु) means "Scheme Bridge" — we bridge the gap between Indian citizens and the hundreds of welfare schemes meant for them.',
    
    missionTitle: 'Our Mission',
    missionDesc: 'To ensure every Indian citizen can discover and access the government welfare schemes they are rightfully entitled to, through technology and AI.',
    
    visionTitle: 'Our Vision',
    visionDesc: 'A digitally empowered India where no deserving citizen misses out on government benefits due to lack of awareness or information.',
    
    whyTitle: 'Why We Built This',
    whyDesc: 'Over 1000+ government schemes exist, yet awareness is low. We use AI to match citizens with schemes in under 2 minutes. Completely free.',
    
    statSchemes: 'Schemes Indexed',
    statMatching: 'AI Powered Matching',
    statLanguages: 'Languages',
    statFree: 'Always & Forever',
    
    diffTitle: 'What Makes YojanaSetu Different',
    
    diffItems: [
      { title: 'AI-Powered Matching', desc: 'Our smart algorithm matches your profile against 500+ schemes in seconds.' },
      { title: 'Bilingual Support', desc: 'Fully available in Hindi and English. More languages coming soon.' },
      { title: 'Privacy First', desc: 'No registration required. We never store your personal information.' },
      { title: 'Mobile First', desc: 'Works perfectly on smartphones, tablets and desktop computers.' },
      { title: 'Fast & Free', desc: 'Results in under 2 minutes. No hidden charges, ever.' },
      { title: 'Accurate Eligibility', desc: 'Detailed eligibility criteria to ensure accurate scheme recommendations.' }
    ],
    
    techTitle: 'Built With Modern Technology',
    
    techItems: [
      { name: 'React 18', desc: 'Frontend' },
      { name: 'Vite', desc: 'Build Tool' },
      { name: 'Node.js', desc: 'Runtime' },
      { name: 'Express', desc: 'API' },
      { name: 'MongoDB', desc: 'Database' },
      { name: 'Gemini AI', desc: 'Intelligence' }
    ],
    
    ctaTitle: 'Start Discovering Your Benefits',
    ctaSub: 'Takes less than 2 minutes. No signup needed.',
    ctaPrimaryBtn: '🎯 Find My Schemes',
    ctaSecondaryBtn: 'Browse All Schemes'
  }
};

const TEAM = [
  { name: 'Priya Sharma', roleHi: 'फुल स्टैक डेवलपर', roleEn: 'Full Stack Developer', emoji: '👩‍💻' },
  { name: 'Arjun Mehta', roleHi: 'एआई/एमएल इंजीनियर', roleEn: 'AI/ML Engineer', emoji: '🤖' },
  { name: 'Deepika Nair', roleHi: 'यूएक्स डिजाइनर', roleEn: 'UX Designer', emoji: '🎨' },
  { name: 'Rahul Verma', roleHi: 'डेटा विश्लेषक', roleEn: 'Data Analyst', emoji: '📊' }
];

const About = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="about-page page-enter">
      {/* Hero */}
      <div className="about-hero">
        <div className="container about-hero-content">
          <div className="about-hero-badge animate-fade-in-down">{t.heroBadge}</div>
          <h1 className="about-hero-title animate-fade-in-up">
            {language === 'hi' ? (
              <>
                {t.heroTitle}<br />
                <span className="text-gradient">{t.heroTitleAccent}</span>
              </>
            ) : (
              <>
                {t.heroTitle}<br />
                <span className="text-gradient">{t.heroTitleAccent}</span>
              </>
            )}
          </h1>
          <p className="about-hero-sub animate-fade-in-up delay-100">
            {t.heroSub}
          </p>
        </div>
      </div>

      <div className="container about-body">
        {/* Mission */}
        <section className="about-section animate-fade-in-up">
          <div className="about-mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>{t.missionTitle}</h3>
              <p>{t.missionDesc}</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">👁</div>
              <h3>{t.visionTitle}</h3>
              <p>{t.visionDesc}</p>
            </div>
            <div className="mission-card">
              <div className="mission-icon">💡</div>
              <h3>{t.whyTitle}</h3>
              <p>{t.whyDesc}</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="about-stats animate-fade-in-up">
          {[
            { icon: '📋', value: '500+', label: t.statSchemes },
            { icon: '🤖', value: 'AI', label: t.statMatching },
            { icon: '🌐', label: t.statLanguages, value: '2' },
            { icon: '🆓', value: 'Free', label: t.statFree }
          ].map((s, i) => (
            <div key={i} className="about-stat">
              <div className="about-stat-icon">{s.icon}</div>
              <div className="about-stat-value">{s.value}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Features */}
        <section className="about-features animate-fade-in-up">
          <h2 className="about-section-title">{t.diffTitle}</h2>
          <div className="features-grid">
            {t.diffItems.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">
                  {i === 0 ? '🤖' : i === 1 ? '🌐' : i === 2 ? '🔒' : i === 3 ? '📱' : i === 4 ? '⚡' : '🎯'}
                </div>
                <h4 className="feature-title">{f.title}</h4>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="about-tech animate-fade-in-up">
          <h2 className="about-section-title">{t.techTitle}</h2>
          <div className="tech-stack">
            {t.techItems.map((tech, i) => (
              <div key={i} className="tech-item">
                <span className="tech-icon">
                  {i === 0 ? '⚛️' : i === 1 ? '⚡' : i === 2 ? '🟢' : i === 3 ? '🚂' : i === 4 ? '🍃' : '🤖'}
                </span>
                <div>
                  <div className="tech-name">{tech.name}</div>
                  <div className="tech-role">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="about-features animate-fade-in-up" style={{ marginTop: '2.5rem' }}>
          <h2 className="about-section-title">{language === 'hi' ? 'हमारी टीम' : 'Our Team'}</h2>
          <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            {TEAM.map((member, i) => (
              <div key={i} className="mission-card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{member.emoji}</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>{member.name}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {language === 'hi' ? member.roleHi : member.roleEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta animate-fade-in-up">
          <div className="about-cta-card">
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaSub}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/smart-match" className="btn btn-primary btn-xl">{t.ctaPrimaryBtn}</Link>
              <Link to="/schemes" className="btn btn-secondary btn-xl">{t.ctaSecondaryBtn}</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
