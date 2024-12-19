import { Plan } from '../types/plan'

export const plans: Plan[] = [
  {
    name: 'Hobby',
    description: 'Perfect for side projects and hobbyists',
    price: '$0',
    interval: 'forever',
    features: ['Up to 3 projects', 'Basic analytics', 'Community support'],
  },
  {
    name: 'Pro',
    description: 'For professionals and growing businesses',
    price: '$29',
    interval: 'month',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Custom domains',
      'Team collaboration',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    price: '$299',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
    ],
  },
]
