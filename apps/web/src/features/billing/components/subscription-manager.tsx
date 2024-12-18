'use client'

import { useState } from 'react'
import { plans } from '../config/plans'
import { AnimatedPricingCard } from './animated-pricing-card'

type PlanName = 'Hobby' | 'Pro' | 'Enterprise'

export const SubscriptionManager = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async (planName: PlanName) => {
    setIsLoading(true)
    setSelectedPlan(planName)
    try {
      const { url } = { url: 'http://success.url/placeholder' }
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    } finally {
      setIsLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="grid gap-6">
      {plans.map((plan) => (
        <div key={plan.name}>
          <AnimatedPricingCard
            name={plan.name}
            description={plan.description}
            price={plan.price}
            interval={plan.interval}
            features={plan.features}
            buttonText="Subscribe"
            popular={plan.popular}
            isLoading={isLoading}
            isSelected={selectedPlan === plan.name}
            onAction={() => handleSubscribe(plan.name as PlanName)}
            variant="subscription"
          />
        </div>
      ))}
    </div>
  )
}
