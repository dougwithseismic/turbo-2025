export interface UserTraits {
  email?: string
  name?: string
  firstName?: string
  lastName?: string
  phone?: string
  company?: string
  industry?: string
  role?: string
  plan?: string
  subscriptionStatus?: 'active' | 'canceled' | 'expired'
  createdAt?: string | Date
  lastLogin?: string | Date
  [key: string]: unknown
}

export interface UserIdentity {
  userId: string
  traits?: UserTraits
  timestamp: number
}
