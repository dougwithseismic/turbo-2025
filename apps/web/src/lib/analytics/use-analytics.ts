import { useCallback } from 'react'
import type {
  FormEvent,
  ButtonEvent,
  ErrorEvent,
  CustomPageView,
} from './types'
import analytics from './index'

type AnalyticsEventData = Record<string, unknown>

export function useAnalytics() {
  const trackFormSubmit = useCallback((event: FormEvent) => {
    const eventData: AnalyticsEventData = {
      event_type: 'form_submit',
      form_id: event.form_id,
      form_name: event.form_name,
      success: event.success,
      timestamp: event.timestamp ?? Date.now(),
    }

    if (event.error) {
      eventData.error_message = event.error
    }

    if (event.metadata) {
      Object.assign(eventData, event.metadata)
    }

    void analytics.track('form_submit', eventData)
  }, [])

  const trackButtonClick = useCallback((event: ButtonEvent) => {
    const eventData: AnalyticsEventData = {
      event_type: 'button_click',
      button_id: event.button_id,
      button_text: event.button_text,
      button_location: event.page,
      timestamp: event.timestamp ?? Date.now(),
    }

    if (event.metadata) {
      Object.assign(eventData, event.metadata)
    }

    void analytics.track('button_click', eventData)
  }, [])

  const trackError = useCallback((event: ErrorEvent) => {
    const eventData: AnalyticsEventData = {
      event_type: 'error',
      error_code: event.error_code,
      error_message: event.error_message,
      error_path: event.path,
      timestamp: event.timestamp ?? Date.now(),
    }

    if (event.metadata) {
      Object.assign(eventData, event.metadata)
    }

    void analytics.track('error', eventData)
  }, [])

  const trackPageView = useCallback(
    (pageView: Omit<CustomPageView, 'timestamp'>) => {
      const eventData: AnalyticsEventData = {
        path: pageView.path,
        title: pageView.title,
        referrer: pageView.referrer,
        timestamp: Date.now(),
      }

      if (pageView.metadata) {
        Object.assign(eventData, pageView.metadata)
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
