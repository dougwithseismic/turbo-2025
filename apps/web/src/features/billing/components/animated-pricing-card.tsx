import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'

interface PricingFeature {
  text: string
  included: boolean
}

interface AnimatedPricingCardProps {
  name: string
  description: string
  price: string
  interval?: string
  features: PricingFeature[] | string[]
  buttonText: string
  popular?: boolean
  isLoading?: boolean
  isSelected?: boolean
  onAction?: () => void
  variant?: 'default' | 'subscription'
}

const shimmer = {
  initial: {
    backgroundPosition: '200% 0',
    backgroundImage:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
    backgroundSize: '200% 100%',
  },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: [0.4, 0, 0.6, 1],
    },
  },
}

export const AnimatedPricingCard = ({
  name,
  description,
  price,
  interval,
  features,
  buttonText,
  popular,
  isLoading,
  isSelected,
  onAction,
  variant = 'default',
}: AnimatedPricingCardProps) => {
  const renderFeature = (feature: string | PricingFeature, index: number) => {
    const text = typeof feature === 'string' ? feature : feature.text
    const included = typeof feature === 'string' ? true : feature.included

    return (
      <motion.li
        key={text}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 + index * 0.1 }}
        className="flex items-center gap-3"
      >
        <Check
          className={`h-4 w-4 ${
            included ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <span
          className={included ? 'text-foreground' : 'text-muted-foreground'}
        >
          {text}
        </span>
      </motion.li>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card
        className={`relative flex flex-col ${popular ? 'border-primary shadow-lg' : ''}`}
      >
        {popular && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, delay: 0.2 }}
          >
            <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
              Most Popular
            </div>
          </motion.div>
        )}
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-4xl font-bold">{price}</span>
            {interval && (
              <span className="text-muted-foreground">/{interval}</span>
            )}
          </motion.div>
          <ul className="space-y-4">
            {features.map((feature, index) => renderFeature(feature, index))}
          </ul>
        </CardContent>
        <CardFooter>
          {popular ? (
            <motion.div
              className="w-full"
              variants={shimmer}
              initial="initial"
              animate="animate"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                backgroundSize: '200% 100%',
              }}
            >
              <Button
                className="w-full bg-gradient-to-r from-primary via-primary/90 to-primary"
                disabled={isLoading}
                onClick={onAction}
                size="lg"
              >
                {isLoading && isSelected ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  buttonText
                )}
              </Button>
            </motion.div>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              disabled={isLoading}
              onClick={onAction}
              size="lg"
            >
              {isLoading && isSelected ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                buttonText
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
