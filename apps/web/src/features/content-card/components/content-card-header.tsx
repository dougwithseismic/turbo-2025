import type { ReactNode } from 'react'

export interface ContentCardHeaderProps {
  children: ReactNode
}

export interface ContentCardHeaderTitleProps {
  children: ReactNode
}

export interface ContentCardHeaderDescriptionProps {
  children: ReactNode
}

export const Title = ({ children }: ContentCardHeaderTitleProps) => (
  <h3 className="text-lg font-semibold">{children}</h3>
)

export const Description = ({
  children,
}: ContentCardHeaderDescriptionProps) => (
  <p className="text-sm text-muted-foreground">{children}</p>
)

export const ContentCardHeader = ({ children }: ContentCardHeaderProps) => (
  <div className="flex flex-col gap-1.5">{children}</div>
)

ContentCardHeader.Title = Title
ContentCardHeader.Description = Description
