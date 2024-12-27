export interface ShellConfig {
  sidebar: {
    // Layout
    width: number
    collapsedWidth: number
    // Features
    enableLeftPadding: boolean
    enableHoverExpand?: boolean
    enableMobileDrawer?: boolean
    // Persistence
    persistState?: boolean
    storageKey?: string
    // Behavior
    collapseOnNavigate?: boolean
    collapseOnMobileClick?: boolean
    expandOnSearch?: boolean
    // Sections
    collapsibleSections?: boolean
    rememberSectionState?: boolean
    defaultExpandedSections?: string[]
    // Appearance
    showDividers?: boolean
    showSectionTitles?: boolean
  }
}

export const defaultShellConfig: ShellConfig = {
  sidebar: {
    width: 280,
    collapsedWidth: 56,
    enableLeftPadding: true,
    enableHoverExpand: true,
    enableMobileDrawer: true,
    persistState: true,
    storageKey: 'shell-sidebar-expanded',
    // Behavior
    collapseOnNavigate: false,
    collapseOnMobileClick: true,
    expandOnSearch: true,
    // Sections
    collapsibleSections: true,
    rememberSectionState: true,
    defaultExpandedSections: ['main', 'identity'],
    // Appearance
    showDividers: true,
    showSectionTitles: true,
  },
}
