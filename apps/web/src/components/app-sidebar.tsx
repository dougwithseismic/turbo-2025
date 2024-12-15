'use client'

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LucideIcon,
} from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavProjects } from '@/components/nav-projects'
import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import Link from 'next/link'

// Add type for team
type Team = {
  name: string
  logo: LucideIcon
  plan: string
  isSelected?: boolean
}

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
      isSelected: true,
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
      isSelected: false,
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
      isSelected: false,
    },
  ],

  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '/account',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '/account/billing',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(
    data.teams[0] as Team,
  )

  const handleTeamSelect = React.useCallback((team: Team) => {
    setSelectedTeam(team)
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="p-4">
          <div className="relative z-20 flex items-center text-md font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Acme Inc
          </div>
        </Link>
        <TeamSwitcher
          teams={data.teams}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
