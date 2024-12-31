import {
  LayoutDashboard,
  Users,
  Folder,
  Bell,
  BookOpen,
  CookingPot,
} from 'lucide-react'
import type { NavItem } from './nav-link'

export const mainNav: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
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
    title: 'Getting Started',
    href: '/getting-started',
    icon: BookOpen,
  },
  {
    title: 'Cookbooks',
    href: '/cookbooks',
    icon: CookingPot,
  },
]
