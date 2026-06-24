import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { schemeAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import SchemeCard from '../components/ui/SchemeCard';
import './SmartMatch.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

const STEPS = [
  { id: 'age', icon: '👤', title: 'Age' },
  { id: 'gender', icon: '🚻', title: 'Gender' },
  { id: 'income', icon: '💰', title: 'Income' },
  { id: 'caste', icon: '📊', title: 'Category' },
  { id: 'state', icon: '🗺', title: 'State' },
  { id: 'occupation', icon: '💼', title: 'Occupation' }
];

const SmartMatch = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    age: '',
    gender: '',
    income: '',
    caste: '',
    state: '',
    occupation: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Voice recognition states
  const [activeMode, setActiveMode] = useState('voice'); // 'voice' or 'form'
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [storySaved, setStorySaved] = useState(false);

  useEffect(() => {
    if (location.state?.profile) {
      const runPassedMatch = async () => {
        setLoading(true);
        setError(null);
        try {
          const cleanProfile = location.state.profile;
          setProfile(cleanProfile);
          const res = await schemeAPI.match(cleanProfile);
          setResults(res?.data || []);
          setStep(STEPS.length); // Jump to results
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      runPassedMatch();
    }
  }, [location]);

  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setRecognizing(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setRecognizing(false);
    };

    recognition.onend = () => {
      setRecognizing(false);
    };

    recognition.start();
  };

  const handleVoiceSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!transcript.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: transcript })
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const parsedProfile = result.data;
        const cleanProfile = {};
        
        if (parsedProfile.age) cleanProfile.age = parseInt(parsedProfile.age);
        if (parsedProfile.gender) cleanProfile.gender = parsedProfile.gender;
        if (parsedProfile.income) cleanProfile.income = parseInt(parsedProfile.income);
        if (parsedProfile.caste) cleanProfile.caste = parsedProfile.caste;
        if (parsedProfile.state) cleanProfile.state = parsedProfile.state;
        if (parsedProfile.occupation) cleanProfile.occupation = parsedProfile.occupation;

        setProfile({
          age: cleanProfile.age || '',
          gender: cleanProfile.gender || '',
          income: cleanProfile.income || '',
          caste: cleanProfile.caste || '',
          state: cleanProfile.state || '',
          occupation: cleanProfile.occupation || ''
        });

        const res = await schemeAPI.match(cleanProfile);
        setResults(res?.data || []);
        setStep(STEPS.length); // Go to results
      } else {
        throw new Error(result.error || 'Failed to extract profile details. Try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMatchStory = () => {
    try {
      const stories = JSON.parse(localStorage.getItem('yojanasetu-saved-stories') || '[]');
      const newStory = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        profile: {
          age: profile.age,
          gender: profile.gender,
          income: profile.income,
          caste: profile.caste,
          state: profile.state,
          occupation: profile.occupation
        },
        matchCount: results?.length || 0
      };
      
      const uniqueStories = [newStory, ...stories.filter(s => 
        JSON.stringify(s.profile) !== JSON.stringify(newStory.profile)
      )].slice(0, 10);

      localStorage.setItem('yojanasetu-saved-stories', JSON.stringify(uniqueStories));
      setStorySaved(true);
      setTimeout(() => setStorySaved(false), 3000);
    } catch (e) {
      console.error('Failed to save story:', e);
    }
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleFind();
  };

  const handleFind = async () => {
    setLoading(true);
    setError(null);
    try {
      const cleanProfile = {};
      if (profile.age) cleanProfile.age = parseInt(profile.age);
      if (profile.gender) cleanProfile.gender = profile.gender;
      if (profile.income) cleanProfile.income = parseInt(profile.income);
      if (profile.caste) cleanProfile.caste = profile.caste;
      if (profile.state) cleanProfile.state = profile.state;
      if (profile.occupation) cleanProfile.occupation = profile.occupation;

      const res = await schemeAPI.match(cleanProfile);
      setResults(res?.data || []);
      setStep(STEPS.length); // Go to results
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setProfile({ age: '', gender: '', income: '', caste: '', state: '', occupation: '' });
    setResults(null);
    setError(null);
    setTranscript('');
    setStorySaved(false);
  };

  const isResults = step === STEPS.length;
  const progress = Math.min((step / STEPS.length) * 100, 100);

  const renderStep = () => {
    const currentStep = STEPS[step];

    switch (currentStep?.id) {
      case 'age':
        return (
          <div className="match-step-content">
            <label className="match-label">{t(language, 'match.age')}</label>
            <input
              type="number"
              className="input match-input-large"
              placeholder="e.g. 25"
              value={profile.age}
              onChange={e => updateProfile('age', e.target.value)}
              min="0" max="150"
              id="match-age-input"
              autoFocus
            />
          </div>
        );

      case 'gender':
        return (
          <div className="match-step-content">
            <label className="match-label">{t(language, 'match.gender')}</label>
            <div className="option-grid">
              {['male', 'female', 'other'].map(g => (
                <button
                  key={g}
                  className={`option-btn ${profile.gender === g ? 'selected' : ''}`}
                  onClick={() => updateProfile('gender', g)}
                  id={`gender-${g}`}
                >
                  <span className="option-icon">
                    {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'}
                  </span>
                  <span>{t(language, `match.${g}`)}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'income':
        return (
          <div className="match-step-content">
            <label className="match-label">{t(language, 'match.income')}</label>
            <div className="income-options">
              {[
                { label: 'Below ₹1 Lakh', value: 80000 },
                { label: '₹1–2 Lakh', value: 150000 },
                { label: '₹2–5 Lakh', value: 350000 },
                { label: '₹5–10 Lakh', value: 750000 },
                { label: 'Above ₹10 Lakh', value: 1200000 }
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`income-option ${profile.income === String(opt.value) ? 'selected' : ''}`}
                  onClick={() => updateProfile('income', String(opt.value))}
                  id={`income-${opt.value}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="step-skip" onClick={() => setStep(s => s + 1)}>Skip this step →</p>
          </div>
        );

      case 'caste':
        return (
          <div className="match-step-content">
            <label className="match-label">{t(language, 'match.caste')}</label>
            <div className="option-grid">
              {['general', 'sc', 'st', 'obc'].map(c => (
                <button
                  key={c}
                  className={`option-btn ${profile.caste === c ? 'selected' : ''}`}
                  onClick={() => updateProfile('caste', c)}
                  id={`caste-${c}`}
                >
                  <span>{t(language, `match.${c}`)}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'state':
        return (
          <div className="match-step-content">
            <label className="match-label">{t(language, 'match.state')}</label>
            <select
              className="input match-select"
              value={profile.state}
              onChange={e => updateProfile('state', e.target.value)}
              id="state-select"
            >
              <option value="">Select your state</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        );

      case 'occupation':
        return (
          <div className="match-step-content">
            <label className="match-label">{t(language, 'match.occupation')}</label>
            <div className="option-grid">
              {[
                { key: 'farmer', icon: '🌾', label: t(language, 'match.farmer') },
                { key: 'student', icon: '📚', label: t(language, 'match.student') },
                { key: 'employed', icon: '💼', label: t(language, 'match.employed') },
                { key: 'unemployed', icon: '🔍', label: t(language, 'match.unemployed') },
                { key: 'self-employed', icon: '🏪', label: t(language, 'match.selfEmployed') },
                { key: 'other', icon: '🧑', label: 'Other' }
              ].map(opt => (
                <button
                  key={opt.key}
                  className={`option-btn ${profile.occupation === opt.key ? 'selected' : ''}`}
                  onClick={() => updateProfile('occupation', opt.key)}
                  id={`occ-${opt.key}`}
                >
                  <span className="option-icon">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderVoiceMode = () => {
    const suggestions = language === 'hi' ? [
      "मैं राजस्थान से हूँ, मेरी आयु 25 वर्ष है और मैं एक गरीब किसान हूँ, मेरी आय 80 हजार है",
      "मैं बिहार से 20 साल का एक छात्र हूँ, मेरी वार्षिक आय 50000 है",
      "मैं उत्तर प्रदेश से 35 साल की एक महिला हूँ, मेरी आय 1.5 लाख है और मैं बेरोजगार हूँ"
    ] : [
      "I am a 25 year old male farmer from Rajasthan with income 80000",
      "I am a 20 year old student from Bihar and my annual income is 50000",
      "I am a 35 year old female from Uttar Pradesh with income 1.5 lakh"
    ];

    return (
      <div className="voice-mode-console animate-fade-in">
        <div className="voice-mic-container">
          <button 
            className={`voice-mic-btn ${recognizing ? 'pulse-active' : ''}`}
            onClick={startSpeechRecognition}
            disabled={loading}
            type="button"
            id="voice-mic-trigger"
          >
            {recognizing ? (
              <div className="pulse-waves">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : '🎙'}
          </button>
          <p className="voice-mic-label">
            {recognizing 
              ? (language === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') 
              : (language === 'hi' ? 'बोलने के लिए माइक दबाएं' : 'Tap microphone to speak')}
          </p>
        </div>

        <form onSubmit={handleVoiceSearchSubmit} className="voice-transcript-form">
          <textarea
            className="input voice-transcript-box"
            placeholder={language === 'hi' 
              ? 'आपकी आवाज यहाँ पाठ में दिखाई देगी... आप इसे संपादित भी कर सकते हैं।' 
              : 'Your speech will appear here. You can also edit it manually.'}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows="3"
            id="voice-transcript-box"
          />
          
          <div className="voice-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setTranscript('')}
              disabled={!transcript || loading}
              id="clear-transcript-btn"
            >
              🗑 {language === 'hi' ? 'साफ करें' : 'Clear'}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!transcript.trim() || loading}
              id="submit-voice-search-btn"
            >
              {loading ? '⟳ Matching...' : `🚀 ${language === 'hi' ? 'स्कीम खोजें' : 'Search Schemes'}`}
            </button>
          </div>
        </form>

        <div className="voice-suggestions-box">
          <h4 className="suggestions-title">
            💡 {language === 'hi' ? 'आप इस तरह बोल सकते हैं:' : 'Suggestions on what to say:'}
          </h4>
          <div className="suggestions-list">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="suggestion-chip hover-scale"
                onClick={() => setTranscript(s)}
                type="button"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="smart-match-page page-enter">
      {/* Header */}
      <div className="match-hero">
        <div className="container match-hero-content">
          <div className="section-pill animate-fade-in-down">🎯 AI-Powered</div>
          <h1 className="match-hero-title animate-fade-in-up">
            {t(language, 'match.title')}
          </h1>
          <p className="match-hero-subtitle animate-fade-in-up delay-100">
            {t(language, 'match.subtitle')}
          </p>
        </div>
      </div>

      <div className="container match-body">
        {/* Toggle Mode Tabs */}
        {!isResults && (
          <div className="match-tabs animate-fade-in-up">
            <button 
              className={`match-tab ${activeMode === 'voice' ? 'active' : ''}`}
              onClick={() => { setActiveMode('voice'); reset(); }}
              id="mode-voice-btn"
            >
              🎙 {language === 'hi' ? 'एआई वॉयस सर्च (Voice Match)' : 'Voice Matching Mode'}
            </button>
            <button 
              className={`match-tab ${activeMode === 'form' ? 'active' : ''}`}
              onClick={() => { setActiveMode('form'); reset(); }}
              id="mode-form-btn"
            >
              📋 {language === 'hi' ? 'स्टेप-बाय-स्टेप फॉर्म (Form)' : 'Step-by-Step Form'}
            </button>
          </div>
        )}

        {!isResults ? (
          <div className="match-wizard animate-scale-in">
            {activeMode === 'voice' ? (
              renderVoiceMode()
            ) : (
              <>
                {/* Progress */}
                <div className="match-progress-bar">
                  <div className="match-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                {/* Step Indicators */}
                <div className="step-indicators">
                  {STEPS.map((s, i) => (
                    <div key={s.id} className={`step-indicator ${i < step ? 'done' : i === step ? 'current' : ''}`}>
                      <div className="step-dot">{i < step ? '✓' : s.icon}</div>
                      <div className="step-dot-label">{s.title}</div>
                    </div>
                  ))}
                </div>

                {/* Step Counter */}
                <div className="step-counter">
                  {t(language, 'match.step')} {step + 1} {t(language, 'match.of')} {STEPS.length}
                </div>

                {/* Step Content */}
                <div className="match-card">
                  {renderStep()}
                </div>

                {/* Navigation */}
                <div className="match-navigation">
                  <button
                    className="btn btn-ghost btn-lg"
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    id="match-back-btn"
                  >
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleNext}
                    disabled={loading}
                    id="match-next-btn"
                  >
                    {loading ? (
                      <span className="loading-spinner">⟳ Finding...</span>
                    ) : step === STEPS.length - 1 ? (
                      `🎯 ${t(language, 'match.findSchemes')}`
                    ) : (
                      'Next →'
                    )}
                  </button>
                </div>

                {/* Skip All */}
                <p className="skip-all">
                  <button className="skip-btn" onClick={handleFind} id="match-skip-all-btn">
                    Skip & show all matching schemes
                  </button>
                </p>
              </>
            )}

            {error && (
              <div className="match-error">
                <p>⚠️ {error}</p>
                <p className="error-hint">Make sure the backend server is running on port 5000.</p>
              </div>
            )}
          </div>
        ) : (
          /* Results */
          <div className="match-results animate-fade-in-up">
            <div className="results-header">
              <div className="results-emoji">🎉</div>
              <h2 className="results-title">
                {results?.length > 0
                  ? `${results.length} ${t(language, 'match.results')}`
                  : t(language, 'match.noResults')
                }
              </h2>
              <p className="results-subtitle">
                Based on your profile, here are the best matching schemes for you.
              </p>
              <div className="results-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-secondary" onClick={reset} id="start-over-btn">
                  🔄 Start Over
                </button>
                <button 
                  className={`btn ${storySaved ? 'btn-success' : 'btn-primary'}`} 
                  onClick={saveMatchStory}
                  id="save-story-btn"
                >
                  {storySaved ? '✅ Saved / सहेजा गया' : '💾 Save Story / खोज सहेजें'}
                </button>
              </div>
            </div>

            {results?.length > 0 ? (
              <div className="results-grid">
                {results.map((result, i) => (
                  <SchemeCard
                    key={result.scheme?._id || i}
                    scheme={result.scheme}
                    index={i}
                    showMatchScore={true}
                    matchScore={result.matchPercentage}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>Try widening your criteria or browse all schemes.</p>
                <Link to="/schemes" className="btn btn-primary">Browse All Schemes</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMatch;
