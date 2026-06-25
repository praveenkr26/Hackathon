import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import useSpeech from '../../hooks/useSpeech';
import './SchemeChatbot.css';

const SchemeChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { language } = useLanguage();
  const { speak, stop, isSpeaking } = useSpeech();

  // Load chat history on mount and when chatbot is opened
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await aiAPI.getChatHistory();
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      setActiveSessionId(sessionId);
      setMessages([]);
      setLoading(true);
      const res = await aiAPI.getChatSession(sessionId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load session', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const payload = { message: userText };
      if (activeSessionId) {
        payload.sessionId = activeSessionId;
      }
      
      const res = await aiAPI.chat(payload);
      
      setMessages(prev => [...prev, { role: 'model', content: res.data.message }]);
      speak(res.data.message); // Auto speak
      
      // If it was a new chat, we need to refresh history and set active session
      if (!activeSessionId && res.data.sessionId) {
        setActiveSessionId(res.data.sessionId);
        fetchHistory();
      }
    } catch (err) {
      console.error('Chat error', err);
      const errorMessage = err.response?.data?.error || err.message || '⚠️ Sorry, I encountered an error connecting to AI.';
      setMessages(prev => [...prev, { role: 'model', content: `⚠️ ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm(language === 'hi' ? 'क्या आप इस चैट को डिलीट करना चाहते हैं?' : 'Delete this chat?')) return;
    try {
      await aiAPI.deleteChatSession(sessionId);
      if (activeSessionId === sessionId) startNewChat();
      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm(language === 'hi' ? 'क्या आप पूरी चैट हिस्ट्री डिलीट करना चाहते हैं?' : 'Delete ALL chat history?')) return;
    try {
      await aiAPI.clearChatHistory();
      startNewChat();
      fetchHistory();
      setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="scheme-chatbot-container">
      {/* Floating Action Button */}
      {!isOpen && (
        <button 
          className="chatbot-fab" 
          onClick={() => setIsOpen(true)}
          title={language === 'hi' ? 'योजनाओं के बारे में पूछें' : 'Ask about Schemes'}
        >
          🤖
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Sidebar (History) */}
          <div className={`chatbot-sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>{language === 'hi' ? 'चैट हिस्ट्री' : 'Chat History'}</h3>
              <button className="new-chat-btn" onClick={() => { startNewChat(); setIsSidebarOpen(false); }}>
                {language === 'hi' ? '+ नया' : '+ New'}
              </button>
            </div>
            <div className="history-list">
              {history.map(session => (
                <div 
                  key={session._id} 
                  className={`history-item ${activeSessionId === session._id ? 'active' : ''}`}
                  onClick={() => { loadSession(session._id); setIsSidebarOpen(false); }}
                  title={session.title}
                >
                  <span className="history-title">💬 {session.title}</span>
                  <button 
                    className="delete-history-btn" 
                    onClick={(e) => handleDeleteSession(session._id, e)}
                    title={language === 'hi' ? 'डिलीट करें' : 'Delete'}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <div style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {language === 'hi' ? 'कोई पुरानी चैट नहीं' : 'No recent chats'}
                </div>
              )}
            </div>
            {history.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearHistory}>
                {language === 'hi' ? 'सभी डिलीट करें' : 'Clear All'}
              </button>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="chatbot-main">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="menu-toggle-btn" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  title={language === 'hi' ? 'हिस्ट्री देखें' : 'View History'}
                >
                  ☰
                </button>
                <h4>{language === 'hi' ? 'योजनासेतु एआई' : 'YojanaSetu AI'}</h4>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className="chat-messages">
              {messages.length === 0 && !loading && (
                <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-light)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>✨</div>
                  <p>{language === 'hi' ? 'नमस्ते! मैं आपकी योजनाओं से जुड़ी मदद कैसे कर सकता हूँ?' : 'Hello! How can I help you find welfare schemes today?'}</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  {msg.role === 'model' ? (
                    <div className="message-markdown" style={{ position: 'relative' }}>
                      <ReactMarkdown 
                        components={{
                          a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {/* Speech Controls */}
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => isSpeaking ? stop() : speak(msg.content)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            fontSize: '14px', color: 'var(--text-tertiary)',
                            padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                          title={isSpeaking ? 'Stop speaking' : 'Listen'}
                        >
                          {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>{msg.content}</div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="message model">
                  <div className="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSend}>
              <input 
                type="text" 
                className="chat-input"
                placeholder={language === 'hi' ? 'अपनी जानकारी या सवाल लिखें...' : 'Type your question here...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="send-btn" disabled={!inputValue.trim() || loading}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeChatbot;
