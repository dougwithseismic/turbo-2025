import { useCallback } from 'react'
import type {
  FormEvent,
  ButtonEvent,
  ErrorEvent,
  CustomPageView,
} from './types'
import analytics from './index'

export function useAnalytics() {
  const trackFormSubmit = useCallback((event: FormEvent) => {
    const eventData = {
      event_type: 'form_submit',
      form_id: event.form_id,
      form_name: event.form_name,
      success: event.success,
      timestamp: event.timestamp ?? Date.now(),
      ...(event.error && { error_message: event.error }),
      ...(event.metadata && event.metadata),
    }

    void analytics.track('form_submit', eventData)
  }, [])

  const trackButtonClick = useCallback((event: ButtonEvent) => {
    const eventData = {
      event_type: 'button_click',
      button_id: event.button_id,
      button_text: event.button_text,
      button_location: event.page,
      timestamp: event.timestamp ?? Date.now(),
      ...(event.metadata && event.metadata),
    }

    void analytics.track('button_click', eventData)
  }, [])

  const trackError = useCallback((event: ErrorEvent) => {
    const eventData = {
      event_type: 'error',
      error_code: event.error_code,
      error_message: event.error_message,
      error_path: event.path,
      timestamp: event.timestamp ?? Date.now(),
      ...(event.metadata && event.metadata),
    }

    void analytics.track('error', eventData)
  }, [])

  const trackPageView = useCallback(
    (pageView: Omit<CustomPageView, 'timestamp'>) => {
      const eventData = {
        path: pageView.path,
        title: pageView.title,
        referrer: pageView.referrer,
        timestamp: Date.now(),
        ...(pageView.metadata && pageView.metadata),
      }

      void analytics.page(eventData)
    },
    [],
  )

  const identifyUser = useCallback(
    (userId: string, traits?: Record<string, unknown>) => {
      void analytics.identify(userId, {
        ...traits,
        timestamp: Date.now(),
      })
    },
    [],
  )

  return {
    trackFormSubmit,
    trackButtonClick,
    trackError,
    trackPageView,
    identifyUser,
  }
}
