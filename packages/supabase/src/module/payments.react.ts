import {
  type QueryFunction,
  type QueryKey,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  type PaymentAccountWithMethods,
  type PaymentMethod,
  type PaymentProviderAccount,
  addPaymentMethod,
  createPaymentAccount,
  getPaymentAccount,
  getPaymentAccountWithMethods,
  getPaymentMethods,
  removePaymentMethod,
  updatePaymentMethod,
} from './payments'

// Common Types
import type { QueryEnabledProps, SupabaseProps } from '../types/react-query'

type PaymentResponse<T> = {
  data: T
  error: PaymentError | null
}

/**
 * Custom error class for handling payment-related errors with additional context
 *
 * @example
 * ```ts
 * // Create a new error
 * const error = new PaymentError('Payment method not found', 'NOT_FOUND', 404)
 *
 * // Convert from unknown error
 * try {
 *   await someOperation()
 * } catch (err) {
 *   throw PaymentError.fromError(err, 'OPERATION_ERROR')
 * }
 * ```
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'PaymentError'
  }

  static fromError(
    err: unknown,
    code = 'UNKNOWN_ERROR',
    status = 500,
  ): PaymentError {
    if (err instanceof Error) {
      return new PaymentError(
        err.message,
        err instanceof PaymentError ? err.code : code,
        err instanceof PaymentError ? err.status : status,
      )
    }
    return new PaymentError('An unknown error occurred', code, status)
  }
}

// Query Key Types
type BaseKey = ['payments']
type AccountKey = [...BaseKey, 'account', string, string]
type MethodsKey = [...BaseKey, 'methods', string]
type AccountWithMethodsKey = [
  ...BaseKey,
  'account-with-methods',
  string,
  string,
]

/**
 * Query key factory for payments with proper type safety
 *
 * @example
 * ```ts
 * // Get base key
 * const baseKey = paymentKeys.all() // ['payments']
 *
 * // Get account key
 * const accountKey = paymentKeys.account({
 *   ownerType: 'organization',
 *   ownerId: '123'
 * })
 *
 * // Get methods key
 * const methodsKey = paymentKeys.methods({ accountId: '123' })
 *
 * // Get account with methods key
 * const accountWithMethodsKey = paymentKeys.accountWithMethods({
 *   ownerType: 'organization',
 *   ownerId: '123'
 * })
 * ```
 */
export const paymentKeys = {
  all: (): BaseKey => ['payments'],
  account: ({
    ownerType,
    ownerId,
  }: {
    ownerType: 'user' | 'organization'
    ownerId: string
  }): AccountKey => [...paymentKeys.all(), 'account', ownerType, ownerId],
  methods: ({ accountId }: { accountId: string }): MethodsKey => [
    ...paymentKeys.all(),
    'methods',
    accountId,
  ],
  accountWithMethods: ({
    ownerType,
    ownerId,
  }: {
    ownerType: 'user' | 'organization'
    ownerId: string
  }): AccountWithMethodsKey => [
    ...paymentKeys.all(),
    'account-with-methods',
    ownerType,
    ownerId,
  ],
} as const

type GetPaymentAccountParams = SupabaseProps & {
  ownerType: 'user' | 'organization'
  ownerId: string
  providerName?: string
} & QueryEnabledProps

type PaymentQueryKey = ReturnType<typeof paymentKeys.all>
type PaymentAccountKey = ReturnType<typeof paymentKeys.account>
type PaymentMethodsKey = ReturnType<typeof paymentKeys.methods>

/**
 * Query options factory for payment queries with error handling
 *
 * @example
 * ```ts
 * // Use in a custom query
 * const { data } = useQuery({
 *   ...paymentQueries.account({
 *     supabase,
 *     ownerType: 'organization',
 *     ownerId: '123'
 *   })
 * })
 * ```
 */
export const paymentQueries = {
  account: ({
    supabase,
    ownerType,
    ownerId,
    providerName,
  }: Omit<GetPaymentAccountParams, 'enabled'>): UseQueryOptions<
    PaymentProviderAccount,
    PaymentError
  > => ({
    queryKey: paymentKeys.account({ ownerType, ownerId }),
    queryFn: async () => {
      try {
        const data = await getPaymentAccount({
          supabase,
          ownerType,
          ownerId,
          providerName,
        })
        if (!data) {
          throw new PaymentError('Payment account not found', 'NOT_FOUND', 404)
        }
        return data
      } catch (err) {
        throw PaymentError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  methods: ({
    supabase,
    accountId,
  }: SupabaseProps & {
    accountId: string
  }): UseQueryOptions<PaymentMethod[], PaymentError> => ({
    queryKey: paymentKeys.methods({ accountId }),
    queryFn: async () => {
      try {
        return await getPaymentMethods({ supabase, accountId })
      } catch (err) {
        throw PaymentError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),

  accountWithMethods: ({
    supabase,
    ownerType,
    ownerId,
    providerName,
  }: Omit<GetPaymentAccountParams, 'enabled'>): UseQueryOptions<
    PaymentAccountWithMethods,
    PaymentError
  > => ({
    queryKey: paymentKeys.accountWithMethods({ ownerType, ownerId }),
    queryFn: async () => {
      try {
        const data = await getPaymentAccountWithMethods({
          supabase,
          ownerType,
          ownerId,
          providerName,
        })
        if (!data) {
          throw new PaymentError('Payment account not found', 'NOT_FOUND', 404)
        }
        return data
      } catch (err) {
        throw PaymentError.fromError(err, 'FETCH_ERROR')
      }
    },
  }),
}

/**
 * React hook to fetch a payment account with type safety and error handling
 *
 * @example
 * ```ts
 * // Basic usage
 * const { data, error } = useGetPaymentAccount({
 *   supabase,
 *   ownerType: 'organization',
 *   ownerId: '123'
 * })
 *
 * // With provider name
 * const { data, error } = useGetPaymentAccount({
 *   supabase,
 *   ownerType: 'organization',
 *   ownerId: '123',
 *   providerName: 'stripe'
 * })
 * ```
 */
export const useGetPaymentAccount = ({
  supabase,
  ownerType,
  ownerId,
  providerName,
  enabled = true,
}: GetPaymentAccountParams): PaymentResponse<PaymentProviderAccount | null> => {
  const { data, error } = useQuery<PaymentProviderAccount, PaymentError>({
    ...paymentQueries.account({ supabase, ownerType, ownerId, providerName }),
    enabled: Boolean(ownerId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type GetPaymentMethodsParams = SupabaseProps & {
  accountId: string
} & QueryEnabledProps

/**
 * React hook to fetch payment methods with type safety and error handling
 *
 * @example
 * ```ts
 * const { data, error } = useGetPaymentMethods({
 *   supabase,
 *   accountId: '123'
 * })
 * ```
 */
export const useGetPaymentMethods = ({
  supabase,
  accountId,
  enabled = true,
}: GetPaymentMethodsParams): PaymentResponse<PaymentMethod[]> => {
  const { data, error } = useQuery<PaymentMethod[], PaymentError>({
    ...paymentQueries.methods({ supabase, accountId }),
    enabled: Boolean(accountId) && enabled,
  })

  return {
    data: data ?? [],
    error: error ?? null,
  }
}

/**
 * React hook to fetch a payment account with its methods
 *
 * @example
 * ```ts
 * const { data, error } = useGetPaymentAccountWithMethods({
 *   supabase,
 *   ownerType: 'organization',
 *   ownerId: '123'
 * })
 * ```
 */
export const useGetPaymentAccountWithMethods = ({
  supabase,
  ownerType,
  ownerId,
  providerName,
  enabled = true,
}: GetPaymentAccountParams): PaymentResponse<PaymentAccountWithMethods | null> => {
  const { data, error } = useQuery<PaymentAccountWithMethods, PaymentError>({
    ...paymentQueries.accountWithMethods({
      supabase,
      ownerType,
      ownerId,
      providerName,
    }),
    enabled: Boolean(ownerId) && enabled,
  })

  return {
    data: data ?? null,
    error: error ?? null,
  }
}

type CreatePaymentAccountRequest = {
  providerId: string
  ownerType: 'user' | 'organization'
  ownerId: string
  providerCustomerId: string
  providerData?: Record<string, unknown>
  isDefault?: boolean
}

/**
 * React hook to create a new payment account with error handling
 *
 * @example
 * ```ts
 * const mutation = useCreatePaymentAccount({ supabase })
 *
 * // Create account
 * mutation.mutate({
 *   providerId: 'stripe',
 *   ownerType: 'organization',
 *   ownerId: '123',
 *   providerCustomerId: 'cus_123',
 *   isDefault: true
 * })
 * ```
 */
export const useCreatePaymentAccount = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    PaymentProviderAccount,
    PaymentError,
    CreatePaymentAccountRequest
  >({
    mutationFn: async ({
      providerId,
      ownerType,
      ownerId,
      providerCustomerId,
      providerData,
      isDefault,
    }) => {
      try {
        return await createPaymentAccount({
          supabase,
          providerId,
          ownerType,
          ownerId,
          providerCustomerId,
          providerData,
          isDefault,
        })
      } catch (err) {
        throw PaymentError.fromError(err, 'CREATE_ERROR')
      }
    },
    onSuccess: (_, { ownerType, ownerId }) => {
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.account({ ownerType, ownerId }),
      })
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.accountWithMethods({ ownerType, ownerId }),
      })
    },
  })
}

type AddPaymentMethodRequest = {
  accountId: string
  ownerType: 'user' | 'organization'
  ownerId: string
  providerPaymentMethodId: string
  type: string
  providerData?: Record<string, unknown>
  isDefault?: boolean
}

/**
 * React hook to add a payment method with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useAddPaymentMethod({ supabase })
 *
 * // Add method
 * mutation.mutate({
 *   accountId: '123',
 *   ownerType: 'organization',
 *   ownerId: '456',
 *   providerPaymentMethodId: 'pm_789',
 *   type: 'card',
 *   isDefault: true
 * })
 * ```
 */
export const useAddPaymentMethod = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<PaymentMethod, PaymentError, AddPaymentMethodRequest>({
    mutationFn: async ({
      accountId,
      providerPaymentMethodId,
      type,
      providerData,
      isDefault,
    }) => {
      try {
        return await addPaymentMethod({
          supabase,
          accountId,
          providerPaymentMethodId,
          type,
          providerData,
          isDefault,
        })
      } catch (err) {
        throw PaymentError.fromError(err, 'ADD_ERROR')
      }
    },
    onSuccess: (_, { accountId, ownerType, ownerId }) => {
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.methods({ accountId }),
      })
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.accountWithMethods({ ownerType, ownerId }),
      })
    },
  })
}

type UpdatePaymentMethodRequest = {
  id: string
  accountId: string
  ownerType: 'user' | 'organization'
  ownerId: string
  isDefault?: boolean
  providerData?: Record<string, unknown>
}

/**
 * React hook to update a payment method with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useUpdatePaymentMethod({ supabase })
 *
 * // Update method
 * mutation.mutate({
 *   id: '123',
 *   accountId: '456',
 *   ownerType: 'organization',
 *   ownerId: '789',
 *   isDefault: true
 * })
 * ```
 */
export const useUpdatePaymentMethod = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    PaymentMethod,
    PaymentError,
    UpdatePaymentMethodRequest,
    { previousMethods: PaymentMethod[] | undefined }
  >({
    mutationFn: async ({ id, isDefault, providerData }) => {
      try {
        return await updatePaymentMethod({
          supabase,
          id,
          isDefault,
          providerData,
        })
      } catch (err) {
        throw PaymentError.fromError(err, 'UPDATE_ERROR')
      }
    },
    onMutate: async ({ accountId, isDefault, ...request }) => {
      await queryClient.cancelQueries({
        queryKey: paymentKeys.methods({ accountId }),
      })
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(
        paymentKeys.methods({ accountId }),
      )

      if (previousMethods && isDefault !== undefined) {
        const updatedMethods = previousMethods.map((method) => ({
          ...method,
          is_default: method.id === request.id ? isDefault : false,
        }))

        queryClient.setQueryData<PaymentMethod[]>(
          paymentKeys.methods({ accountId }),
          updatedMethods,
        )
      }

      return { previousMethods }
    },
    onError: (err, { accountId }, context) => {
      if (context?.previousMethods) {
        queryClient.setQueryData(
          paymentKeys.methods({ accountId }),
          context.previousMethods,
        )
      }
    },
    onSuccess: (_, { accountId, ownerType, ownerId }) => {
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.methods({ accountId }),
      })
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.accountWithMethods({ ownerType, ownerId }),
      })
    },
  })
}

type RemovePaymentMethodRequest = {
  id: string
  accountId: string
  ownerType: 'user' | 'organization'
  ownerId: string
}

/**
 * React hook to remove a payment method with optimistic updates and error handling
 *
 * @example
 * ```ts
 * const mutation = useRemovePaymentMethod({ supabase })
 *
 * // Remove method
 * mutation.mutate({
 *   id: '123',
 *   accountId: '456',
 *   ownerType: 'organization',
 *   ownerId: '789'
 * })
 * ```
 */
export const useRemovePaymentMethod = ({ supabase }: SupabaseProps) => {
  const queryClient = useQueryClient()

  return useMutation<
    boolean,
    PaymentError,
    RemovePaymentMethodRequest,
    { previousMethods: PaymentMethod[] | undefined }
  >({
    mutationFn: async ({ id }) => {
      try {
        await removePaymentMethod({ supabase, id })
        return true
      } catch (err) {
        throw PaymentError.fromError(err, 'REMOVE_ERROR')
      }
    },
    onMutate: async ({ accountId, id }) => {
      await queryClient.cancelQueries({
        queryKey: paymentKeys.methods({ accountId }),
      })
      const previousMethods = queryClient.getQueryData<PaymentMethod[]>(
        paymentKeys.methods({ accountId }),
      )

      if (previousMethods) {
        const updatedMethods = previousMethods.filter(
          (method) => method.id !== id,
        )
        queryClient.setQueryData<PaymentMethod[]>(
          paymentKeys.methods({ accountId }),
          updatedMethods,
        )
      }

      return { previousMethods }
    },
    onError: (err, { accountId }, context) => {
      if (context?.previousMethods) {
        queryClient.setQueryData(
          paymentKeys.methods({ accountId }),
          context.previousMethods,
        )
      }
    },
    onSuccess: (_, { accountId, ownerType, ownerId }) => {
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.methods({ accountId }),
      })
      void queryClient.invalidateQueries({
        queryKey: paymentKeys.accountWithMethods({ ownerType, ownerId }),
      })
    },
  })
}
