// src/components/TagTooltip.tsx
// Shared dumb tooltip: wraps children and renders a portal-positioned tip on hover.
// The portal anchors to document.body and positions relative to the trigger rect.
// Markup, positioning math, and styling are identical to the original page.tsx version.

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { G } from './tokens';

export interface TagTooltipProps {
  children: React.ReactNode;
  tip: string;
}

export function TagTooltip({ children, tip }: TagTooltipProps) {
  const [show, setShow] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const handleEnter = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setCoords({ top: r.top + window.scrollY, left: r.right + window.scrollX });
    }
    setShow(true);
  };

  return (
    <span ref={triggerRef} style={{ display: 'inline-block' }}
      onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <span style={{
          position: 'absolute',
          top: coords.top - 8,
          left: coords.left - 188,
          background: '#1c1c1c', border: `1px solid ${G.border}`,
          color: G.grey, fontSize: 11, padding: '5px 9px', borderRadius: 4,
          whiteSpace: 'normal', width: 180, zIndex: 9999, pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)', lineHeight: 1.4,
          transform: 'translateY(-100%)',
        }}>
          {tip}
        </span>,
        document.body
      )}
    </span>
  );
}

export default TagTooltip;
