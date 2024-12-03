import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { itemVariants } from '../animations/content-card-animations'
import { useContentCard } from '../context/content-card-context'

interface ContentCardEmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export const ContentCardEmptyState = ({
  title = 'No results found',
  description = "Try adjusting your search terms to find what you're looking for.",
  icon,
  className,
}: ContentCardEmptyStateProps) => {
  const { filteredItems, isReady } = useContentCard()

  if (!isReady || filteredItems.length > 0) {
    return null
  }

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </motion.div>
  )
}
