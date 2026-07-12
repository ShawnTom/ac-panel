import type { ReactNode } from 'react';
import './panel.css';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Shared panel wrapper — provides consistent layout and styling.
 */
export function Panel({ children, className = '' }: PanelProps) {
  return (
    <div className={`panel ${className}`}>
      {children}
    </div>
  );
}
