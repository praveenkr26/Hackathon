import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/common/ScrollToTop';
import CursorFollower from './components/common/CursorFollower';
import SchemeChatbot from './components/chat/SchemeChatbot';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Schemes = lazy(() => import('./pages/Schemes'));
const SchemeDetail = lazy(() => import('./pages/SchemeDetail'));
const SmartMatch = lazy(() => import('./pages/SmartMatch'));
const About = lazy(() => import('./pages/About'));

// Loading fallback
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1rem',
    background: 'var(--bg-primary)'
  }}>
    <div style={{
      width: '48px', height: '48px',
      background: 'var(--gradient-brand)',
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem', animation: 'pulse 1.5s ease-in-out infinite'
    }}>🏛</div>
    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading...</p>
  </div>
);

// 404 Page
const NotFound = () => (
  <div style={{
    minHeight: '70vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
    padding: '2rem', gap: '1rem'
  }}>
    <div style={{ fontSize: '4rem' }}>🔍</div>
    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Page Not Found</h1>
    <p style={{ color: 'var(--text-secondary)' }}>The page you are looking for does not exist.</p>
    <a href="/" className="btn btn-primary">Go Home</a>
  </div>
);

// Layout wrapper
const Layout = ({ children }) => (
  <div className="app-layout">
    <CursorFollower />
    <Navbar />
    <main className="app-main">
      {children}
    </main>
    <Footer />
    <SchemeChatbot />
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <LanguageProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/schemes/:id" element={<SchemeDetail />} />
                <Route path="/smart-match" element={<SmartMatch />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
