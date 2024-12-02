'use client'

import {
  type ReactNode,
  Children,
  isValidElement,
  type JSXElementConstructor,
  type ReactElement,
  cloneElement,
  useState,
  useEffect,
} from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Slot } from '@radix-ui/react-slot'
import { useContentCard } from '../context/content-card-context'
import { ContentItem } from './content-item'
import type { ContentCardItem } from '../context/content-card-context'
import { SearchX } from 'lucide-react'

interface ContentCardHeaderProps {
  children: ReactNode
}

const ContentCardHeader = ({ children }: ContentCardHeaderProps) => {
  return children
}

interface ContentCardFooterProps {
  children: ReactNode
}

const ContentCardFooter = ({ children }: ContentCardFooterProps) => {
  return children
}

interface ContentCardBodyProps {
  children: ReactNode
}

const ContentCardBody = ({ children }: ContentCardBodyProps) => {
  const { shouldShowItem, searchQuery } = useContentCard()
  const [visibleChildren, setVisibleChildren] = useState<ReactNode[]>([])

  useEffect(() => {
    const filtered = Children.toArray(children).filter((child) => {
      if (!searchQuery) return true
      if (isValidElement(child) && child.type === ContentItem) {
        const itemData: ContentCardItem = {
          label: child.props.label,
          description: child.props.description,
          ...child.props,
        }
        return shouldShowItem(itemData)
      }
      return true
    })
    setVisibleChildren(filtered)
  }, [children, searchQuery, shouldShowItem])

  if (visibleChildren.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          No matching items found
        </p>
      </div>
    )
  }

  if (visibleChildren.length === 0) return null
  return <>{visibleChildren}</>
}

interface ContentCardRootProps {
  title: string
  description?: string
  children: ReactNode
  itemFilter?: (item: ContentCardItem) => boolean
}

type ContentCardComponent = JSXElementConstructor<any>

const ContentCardRoot = ({
  title,
  description,
  children,
  itemFilter,
}: ContentCardRootProps) => {
  let header: ReactNode | null = null
  let footer: ReactNode | null = null
  let content: ReactNode[] = []

  Children.forEach(children, (child) => {
    if (!child) return

    if (isValidElement(child)) {
      const childType = child.type as ContentCardComponent
      if (childType === ContentCardHeader) {
        header = child.props.children
      } else if (childType === ContentCardFooter) {
        footer = child.props.children
      } else if (childType === ContentCardBody) {
        content.push(child)
      } else {
        content.push(child)
      }
    } else {
      content.push(child)
    }
  })

  if (content.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {header && (
            <div className="ml-4 flex-shrink-0">
              <Slot>{header}</Slot>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{content}</CardContent>
      {footer && (
        <CardFooter>
          <Slot>{footer}</Slot>
        </CardFooter>
      )}
    </Card>
  )
}

export const ContentCard = Object.assign(ContentCardRoot, {
  Header: ContentCardHeader,
  Footer: ContentCardFooter,
  Body: ContentCardBody,
})
