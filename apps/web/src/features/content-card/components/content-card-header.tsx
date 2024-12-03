import type { ReactNode } from 'react'

export interface ContentCardHeaderProps {
  children: ReactNode
}

export const ContentCardHeader = ({ children }: ContentCardHeaderProps) =>
  children
