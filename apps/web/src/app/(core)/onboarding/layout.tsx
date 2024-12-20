import { ThemeToggle } from '@/features/theme/components/theme-toggle'

const TEXT = {
  TESTIMONIAL: {
    QUOTE:
      'This platform has transformed how we monitor and optimize our web presence. The insights are invaluable.',
    AUTHOR: 'Alex Chen, Growth Lead at TechCorp',
  },
  BRAND: 'Acme Analytics',
} as const

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh dark:bg-background">
      <ThemeToggle />
      <div className="container relative flex min-h-svh flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r dark:bg-muted/10 lg:flex">
          <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='white'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            {TEXT.BRAND}
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">&ldquo;{TEXT.TESTIMONIAL.QUOTE}&rdquo;</p>
              <footer className="text-sm">{TEXT.TESTIMONIAL.AUTHOR}</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
