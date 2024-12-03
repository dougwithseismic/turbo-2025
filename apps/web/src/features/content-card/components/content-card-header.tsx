import type { ReactNode } from 'react'

interface ContentCardHeaderProps {
  children: ReactNode
}

export const ContentCardHeader = ({ children }: ContentCardHeaderProps) =>
  children
