import {
  LayoutDashboard,
  Users,
  Folder,
  Bell,
  MessageSquare,
} from 'lucide-react'
import type { NavItem } from './nav-link'

export const mainNav: NavItem[] = [
  {
    title: 'Community',
    href: '/community',
    icon: Users,
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
  },
]

export const identityNav: NavItem[] = [
  {
    title: 'Profile Settings',
    href: '/account',
    icon: Users,
  },
  {
    title: 'Billing & Plans',
    href: '/account/billing',
    icon: Bell,
  },
  {
    title: 'Upgrade',
    href: '/account/plans',
    icon: Users,
  },
]

export const leadsNav: NavItem[] = [
  {
    title: 'Discover',
    href: '/discover',
    icon: Folder,
  },
  {
    title: 'Jobs',
    href: '/jobs',
    icon: Folder,
  },
]

export const projectsNav: NavItem[] = [
  {
    title: 'Projects & Invoices',
    href: '/projects',
    icon: Folder,
  },
  {
    title: 'Wallet',
    href: '/wallet',
    icon: Folder,
  },
]
