import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'
import { CollapsibleItem } from './collapsible-item'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  isExternal?: boolean
}

export interface NavLinkProps extends NavItem {
  isCollapsed: boolean
  pathname: string
}

export function NavLink({
  title,
  href,
  icon: Icon,
  isCollapsed,
  pathname,
}: NavLinkProps) {
  return (
    <CollapsibleItem isCollapsed={isCollapsed} isActive={pathname === href}>
      <Link href={href} className="flex w-full items-center">
        <CollapsibleItem.Trigger tooltip={title}>
          <Icon className="h-4 w-4" />
        </CollapsibleItem.Trigger>
        <CollapsibleItem.Content>{title}</CollapsibleItem.Content>
      </Link>
    </CollapsibleItem>
  )
}
