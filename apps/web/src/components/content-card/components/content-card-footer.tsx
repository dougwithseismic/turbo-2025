import type { ReactNode } from 'react';

export interface ContentCardFooterProps {
  children: ReactNode;
}

export const ContentCardFooter = ({ children }: ContentCardFooterProps) =>
  children;
