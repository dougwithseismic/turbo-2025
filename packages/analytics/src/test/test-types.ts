import type { BaseProperties } from '../types'

// Define test event names and their properties
export type TestEventName =
  | 'test_event'
  | 'button_click'
  | 'form_submit'
  | 'page_view'

// Define properties for each test event
export type TestEventProperties = {
  test_event: BaseProperties & {
    value: string
  }
  button_click: BaseProperties & {
    buttonId: string
    location: string
  }
  form_submit: BaseProperties & {
    formId: string
    success: boolean
  }
  page_view: BaseProperties & {
    path: string
    title: string
  }
}

// Export test-specific analytics event type
export interface TestAnalyticsEvent<T extends TestEventName> {
  name: T
  properties: TestEventProperties[T]
  timestamp: number
}
