export type PlanName = 'Hobby' | 'Pro' | 'Enterprise'

export interface Plan {
  name: PlanName
  description: string
  price: string
  interval: string
  features: string[]
  popular?: boolean
}

export interface SubscriptionManagerProps {
  userId: string
}
