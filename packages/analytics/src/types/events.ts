export type EventName =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'signup'
  | 'login'
  | 'logout'
  | 'purchase'
  | 'error'
  | 'checkout_begin'
  | 'checkout_fail'
  | 'scraper_submit'
  | 'scraper_success'
  | 'session_start'
  | 'session_end'
  | (string & object) // Allow custom events while preserving autocomplete

export interface BaseProperties {
  timestamp?: number
  path?: string
  url?: string
  referrer?: string
  title?: string
  search?: string
}

export interface ButtonClickProperties extends BaseProperties {
  button_id: string
  button_text?: string
  button_type?: 'submit' | 'button' | 'reset'
  button_location?: string
}

export interface FormSubmitProperties extends BaseProperties {
  form_id: string
  form_name?: string
  form_type?: string
  success: boolean
  error_message?: string
}

export interface SignupProperties extends BaseProperties {
  method: 'email' | 'google' | 'github'
  error_message?: string
}

export interface LoginProperties extends BaseProperties {
  method: 'email' | 'google' | 'github'
  success: boolean
  error_message?: string
}

export interface PurchaseProperties extends BaseProperties {
  product_id?: string
  product_name?: string
  price?: number
  currency?: string
  quantity?: number
}

export interface ErrorProperties extends BaseProperties {
  error_message: string
  error_type?: string
  error_code?: string
  stack_trace?: string
}

export interface SessionStartProperties extends BaseProperties {
  session_id: string
  referrer?: string
  initial_path?: string
}

export interface SessionEndProperties extends BaseProperties {
  session_id: string
  duration: number
  page_views: number
  events: number
}

type CustomEventProperties = Record<string, unknown> & BaseProperties

export type EventProperties = {
  [K in EventName]: K extends keyof EventTypeMap
    ? EventTypeMap[K]
    : CustomEventProperties
}

type EventTypeMap = {
  page_view: BaseProperties
  button_click: ButtonClickProperties
  form_submit: FormSubmitProperties
  signup: SignupProperties
  login: LoginProperties
  logout: BaseProperties
  purchase: PurchaseProperties
  error: ErrorProperties
  session_start: SessionStartProperties
  session_end: SessionEndProperties
}
