export interface ShellConfig {
  sidebar: {
    // Layout
    width: number
    collapsedWidth: number
    // Features
    enableLeftPadding: boolean
    enableHoverExpand?: boolean
    enableMobileDrawer?: boolean
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
    // Behavior
    collapseOnNavigate: true,
    collapseOnMobileClick: true,
    expandOnSearch: true,
  },
}
