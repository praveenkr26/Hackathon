import React, { useEffect, useState } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Start closing animation slightly before it is removed from context
    const timer = setTimeout(() => {
      setIsClosing(true);
    }, 4500); // 4.5 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to finish
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info':
      default: return '🔔';
    }
  };

  return (
    <div className={`toast-item ${type} ${isClosing ? 'closing' : ''}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={handleClose}>×</button>
    </div>
  );
};

export default Toast;
