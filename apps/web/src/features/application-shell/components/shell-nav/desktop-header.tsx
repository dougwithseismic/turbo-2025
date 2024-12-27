'use client'

import { GoogleIcon } from '@/components/icons/social-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronFirst } from 'lucide-react'

interface DesktopHeaderProps {
  isExpanded: boolean
  showHoverEffects: boolean
  onToggle: () => void
}

export const DesktopHeader = ({
  isExpanded,
  showHoverEffects,
  onToggle,
}: DesktopHeaderProps) => {
  return (
    <div className="border-b min-h-14">
      <Button
        variant="ghost"
        className={cn(
          'flex h-full w-full',
          isExpanded
            ? 'items-center justify-between'
            : 'items-center justify-center',
        )}
        onClick={onToggle}
      >
        {(isExpanded || (!isExpanded && !showHoverEffects)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <GoogleIcon className="h-4 w-4" />
          </motion.div>
        )}

        {(isExpanded || showHoverEffects) && (
          <motion.div
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: isExpanded ? 0 : 180 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronFirst className="h-4 w-4" />
          </motion.div>
        )}
      </Button>
    </div>
  )
}
