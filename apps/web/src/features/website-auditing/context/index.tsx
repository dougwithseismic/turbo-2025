import {
  createContext,
  useContext,
  type FC,
  type PropsWithChildren,
} from 'react'

interface WebsiteAuditingContextValue {
  /** Current state */
  state: {
    /** Loading state */
    isLoading: boolean
    /** Error state */
    error: Error | null
  }
  /** Actions */
  actions: {
    /** Reset the context state */
    reset: () => void
  }
}

const WebsiteAuditingContext = createContext<
  WebsiteAuditingContextValue | undefined
>(undefined)

interface WebsiteAuditingProviderProps extends PropsWithChildren {
  /** Initial state */
  initialState?: Partial<WebsiteAuditingContextValue['state']>
}

export const WebsiteAuditingProvider: FC<WebsiteAuditingProviderProps> = ({
  children,
  initialState,
}) => {
  const value: WebsiteAuditingContextValue = {
    state: {
      isLoading: initialState?.isLoading ?? false,
      error: initialState?.error ?? null,
    },
    actions: {
      reset: () => {
        // Reset implementation
      },
    },
  }

  return (
    <WebsiteAuditingContext.Provider value={value}>
      {children}
    </WebsiteAuditingContext.Provider>
  )
}

export const useWebsiteAuditingContext = (): WebsiteAuditingContextValue => {
  const context = useContext(WebsiteAuditingContext)
  if (!context) {
    throw new Error(
      'useWebsiteAuditingContext must be used within a WebsiteAuditingProvider',
    )
  }
  return context
}
