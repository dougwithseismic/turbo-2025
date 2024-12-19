import { cn } from '@/lib/utils'
import { NavLink, type NavItem } from './nav-link'
import { Separator } from '@radix-ui/react-separator'
import { motion, AnimatePresence } from 'framer-motion'

interface NavSectionProps {
  title?: string
  items: NavItem[]
  isCollapsed: boolean
  pathname: string
}

export function NavSection({
  title,
  items,
  isCollapsed,
  pathname,
}: NavSectionProps) {
  return (
    <div className={cn('mt-6', !title && 'mt-0', 'w-full')}>
      {title && (
        <motion.div
          layout
          className="mb-2 h-2 px-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isCollapsed ? (
            <Separator
              id="nav-section-separator"
              className="w-full bg-muted h-px"
            />
          ) : (
            <div className="col flex items-center justify-center gap-2">
              <motion.h4 className="whitespace-nowrap max-w-full w-fit text-[9px] text-muted-foreground font-medium uppercase">
                {title}
              </motion.h4>
              <Separator className="w-full bg-muted/60 h-px" />
            </div>
          )}
        </motion.div>
      )}
      <nav className="grid gap-2 p-2">
        <AnimatePresence mode="wait">
          <motion.div
            className="grid gap-2"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {items.map((item) => (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{
                  duration: 0.2,
                  ease: 'easeOut',
                }}
              >
                <NavLink
                  {...item}
                  isCollapsed={isCollapsed}
                  pathname={pathname}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </nav>
    </div>
  )
}
