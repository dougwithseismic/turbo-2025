// Query Key Types
type BaseKey = ['projects']
type ListKey = [...BaseKey, 'list', { filters: Record<string, unknown> }]
type DetailKey = [...BaseKey, 'detail', string]
type MembersKey = [...DetailKey, 'members']
type OrgProjectsKey = [...BaseKey, 'list', { organizationId: string }]
type UserProjectsKey = [...BaseKey, 'user']

export const projectKeys = {
  all: (): BaseKey => ['projects'],
  lists: () => [...projectKeys.all(), 'list'] as const,
  list: ({ filters }: { filters: Record<string, unknown> }): ListKey => [
    ...projectKeys.lists(),
    { filters },
  ],
  details: () => [...projectKeys.all(), 'detail'] as const,
  detail: ({ id }: { id: string }): DetailKey => [...projectKeys.details(), id],
  members: ({ projectId }: { projectId: string }): MembersKey => [
    ...projectKeys.detail({ id: projectId }),
    'members',
  ],
  organizationProjects: ({
    organizationId,
  }: {
    organizationId: string
  }): OrgProjectsKey => [...projectKeys.lists(), { organizationId }],
  userProjects: (): UserProjectsKey => [...projectKeys.all(), 'user'],
} as const
