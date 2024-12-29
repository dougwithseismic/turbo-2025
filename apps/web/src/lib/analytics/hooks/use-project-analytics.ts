import { useCallback } from 'react'
import { useAnalytics } from '../use-analytics'
import type { ProjectEvent } from '../types'

export function useProjectAnalytics() {
  const { trackButtonClick, trackFormSubmit, trackError } = useAnalytics()

  const trackProjectCreation = useCallback(
    (
      projectId: string,
      projectName: string,
      organizationId: string,
      success: boolean,
      error?: string,
    ) => {
      const eventData: ProjectEvent = {
        form_id: 'project-creation',
        form_name: 'Project Creation',
        success,
        error,
        metadata: {
          project_id: projectId,
          project_name: projectName,
          organization_id: organizationId,
        },
      }

      trackFormSubmit(eventData)

      if (success) {
        trackButtonClick({
          button_id: `create-project-${projectId}`,
          button_text: 'Create Project',
          page: 'project-creation',
          metadata: {
            project_id: projectId,
            project_name: projectName,
            organization_id: organizationId,
          },
        })
      } else if (error) {
        trackError({
          error_code: 'project_creation_error',
          error_message: error,
          path: window.location.pathname,
          metadata: {
            project_name: projectName,
            organization_id: organizationId,
          },
        })
      }
    },
    [trackButtonClick, trackFormSubmit, trackError],
  )

  const trackProjectSwitch = useCallback(
    (projectId: string, projectName: string) => {
      trackButtonClick({
        button_id: `switch-project-${projectId}`,
        button_text: `Switch to ${projectName}`,
        page: 'project-switcher',
        metadata: {
          project_id: projectId,
          project_name: projectName,
        },
      })
    },
    [trackButtonClick],
  )

  const trackProjectError = useCallback(
    (
      errorCode: string,
      errorMessage: string,
      projectId?: string,
      projectName?: string,
    ) => {
      trackError({
        error_code: errorCode,
        error_message: errorMessage,
        path: window.location.pathname,
        metadata: projectId
          ? {
              project_id: projectId,
              project_name: projectName,
            }
          : undefined,
      })
    },
    [trackError],
  )

  return {
    trackProjectCreation,
    trackProjectSwitch,
    trackProjectError,
  }
}
