import { useEffect, useRef } from 'react';
import './CursorFollower.css';

const CursorFollower = () => {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    // Only for mouse devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.innerWidth <= 768) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Mouse coords — updated instantly on every move
    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;

    // Ring trailing coords
    let ringX = mouseX;
    let ringY = mouseY;

    let rafId;

    // ── Move dot instantly ──────────────────────────────────────────
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Translate from top-left; offset by half element size (5px for 10px dot)
      dot.style.left = mouseX + 'px';
      dot.style.top  = mouseY + 'px';
    };

    // ── Smooth ring via requestAnimationFrame lerp ──────────────────
    const animate = () => {
      // Lerp: ring catches up by 12% each frame (~60fps = very smooth)
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      rafId = requestAnimationFrame(animate);
    };

    // ── Hover effect via event delegation ──────────────────────────
    const HOVER_SELECTOR = 'a, button, [role="button"], input, select, textarea, label';

    const onMouseOver = (e) => {
      if (e.target.closest(HOVER_SELECTOR)) {
        dot.classList.add('cursor--hover');
        ring.classList.add('cursor--hover');
      }
    };
    const onMouseOut = (e) => {
      if (e.target.closest(HOVER_SELECTOR)) {
        dot.classList.remove('cursor--hover');
        ring.classList.remove('cursor--hover');
      }
    };

    // ── Click effect ────────────────────────────────────────────────
    const onMouseDown = () => {
      dot.classList.add('cursor--click');
      ring.classList.add('cursor--click');
    };
    const onMouseUp = () => {
      dot.classList.remove('cursor--click');
      ring.classList.remove('cursor--click');
    };

    // Register all listeners
    document.addEventListener('mousemove',  onMouseMove,  { passive: true });
    document.addEventListener('mouseover',  onMouseOver,  { passive: true });
    document.addEventListener('mouseout',   onMouseOut,   { passive: true });
    document.addEventListener('mousedown',  onMouseDown,  { passive: true });
    document.addEventListener('mouseup',    onMouseUp,    { passive: true });

    // Start animation loop
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove',  onMouseMove);
      document.removeEventListener('mouseover',  onMouseOver);
      document.removeEventListener('mouseout',   onMouseOut);
      document.removeEventListener('mousedown',  onMouseDown);
      document.removeEventListener('mouseup',    onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  );
};

export default CursorFollower;
