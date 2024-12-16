import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Check } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your needs',
}

interface PricingFeature {
  text: string
  included: boolean
}

interface PricingTier {
  name: string
  price: string
  description: string
  features: PricingFeature[]
  buttonText: string
  popular?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying out our features',
    features: [
      { text: 'Basic portfolio creation', included: true },
      { text: 'Up to 3 projects', included: true },
      { text: 'Community support', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Priority support', included: false },
    ],
    buttonText: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'Best for professionals and growing portfolios',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large teams and organizations',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SLA guarantees', included: true },
      { text: 'Custom contracts', included: true },
      { text: 'Advanced security', included: true },
    ],
    buttonText: 'Contact Sales',
  },
]

const PricingPage = () => {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/account">Account</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Plans</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center items-center px-4 py-8">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the perfect plan for your portfolio needs
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col ${
                tier.popular ? 'border-primary shadow-lg' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-8">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== 'Custom' && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      <Check
                        className={`h-4 w-4 ${
                          feature.included
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <span
                        className={
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold">Need something different?</h2>
          <p className="mt-2 text-muted-foreground">
            Contact our sales team for custom pricing options
          </p>
          <Button variant="outline" className="mt-4">
            Contact Sales
          </Button>
        </div>
      </div>
    </>
  )
}

export default PricingPage
