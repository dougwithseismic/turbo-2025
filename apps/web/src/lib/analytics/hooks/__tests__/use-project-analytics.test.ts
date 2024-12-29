import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useProjectAnalytics } from '../use-project-analytics'
import * as analytics from '../../use-analytics'

// Mock the analytics hook
vi.mock('../../use-analytics', () => ({
  useAnalytics: vi.fn(() => ({
    trackFormSubmit: vi.fn(),
    trackButtonClick: vi.fn(),
    trackError: vi.fn(),
    trackPageView: vi.fn(),
    identifyUser: vi.fn(),
  })),
}))

describe('useProjectAnalytics', () => {
  const mockAnalytics = {
    trackFormSubmit: vi.fn(),
    trackButtonClick: vi.fn(),
    trackError: vi.fn(),
    trackPageView: vi.fn(),
    identifyUser: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(analytics, 'useAnalytics').mockImplementation(() => mockAnalytics)
  })

  it('should track project creation success', () => {
    const { result } = renderHook(() => useProjectAnalytics())
    const projectId = 'test-project'
    const projectName = 'Test Project'
    const organizationId = 'test-org'

    result.current.trackProjectCreation(
      projectId,
      projectName,
      organizationId,
      true,
    )

    expect(mockAnalytics.trackFormSubmit).toHaveBeenCalledWith({
      form_id: 'project-creation',
      form_name: 'Project Creation',
      success: true,
      metadata: {
        project_id: projectId,
        project_name: projectName,
        organization_id: organizationId,
      },
    })

    expect(mockAnalytics.trackButtonClick).toHaveBeenCalledWith({
      button_id: `create-project-${projectId}`,
      button_text: 'Create Project',
      page: 'project-creation',
      metadata: {
        project_id: projectId,
        project_name: projectName,
        organization_id: organizationId,
      },
    })
  })

  it('should track project creation failure', () => {
    const { result } = renderHook(() => useProjectAnalytics())
    const projectId = 'test-project'
    const projectName = 'Test Project'
    const organizationId = 'test-org'
    const error = 'Creation failed'

    result.current.trackProjectCreation(
      projectId,
      projectName,
      organizationId,
      false,
      error,
    )

    expect(mockAnalytics.trackFormSubmit).toHaveBeenCalledWith({
      form_id: 'project-creation',
      form_name: 'Project Creation',
      success: false,
      error,
      metadata: {
        project_id: projectId,
        project_name: projectName,
        organization_id: organizationId,
      },
    })

    expect(mockAnalytics.trackError).toHaveBeenCalledWith({
      error_code: 'project_creation_error',
      error_message: error,
      path: window.location.pathname,
      metadata: {
        project_name: projectName,
        organization_id: organizationId,
      },
    })
  })

  it('should track project switching', () => {
    const { result } = renderHook(() => useProjectAnalytics())
    const projectId = 'test-project'
    const projectName = 'Test Project'

    result.current.trackProjectSwitch(projectId, projectName)

    expect(mockAnalytics.trackButtonClick).toHaveBeenCalledWith({
      button_id: `switch-project-${projectId}`,
      button_text: `Switch to ${projectName}`,
      page: 'project-switcher',
      metadata: {
        project_id: projectId,
        project_name: projectName,
      },
    })
  })

  it('should track project errors', () => {
    const { result } = renderHook(() => useProjectAnalytics())
    const errorCode = 'TEST_ERROR'
    const errorMessage = 'Test error'
    const projectId = 'test-project'
    const projectName = 'Test Project'

    result.current.trackProjectError(
      errorCode,
      errorMessage,
      projectId,
      projectName,
    )

    expect(mockAnalytics.trackError).toHaveBeenCalledWith({
      error_code: errorCode,
      error_message: errorMessage,
      path: window.location.pathname,
      metadata: {
        project_id: projectId,
        project_name: projectName,
      },
    })
  })

  it('should track project errors without project details', () => {
    const { result } = renderHook(() => useProjectAnalytics())
    const errorCode = 'TEST_ERROR'
    const errorMessage = 'Test error'

    result.current.trackProjectError(errorCode, errorMessage)

    expect(mockAnalytics.trackError).toHaveBeenCalledWith({
      error_code: errorCode,
      error_message: errorMessage,
      path: window.location.pathname,
      metadata: undefined,
    })
  })
})
