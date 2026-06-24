import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that resets scroll position to top (0, 0) on route changes
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Reset immediately so page transition starts at the top
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
