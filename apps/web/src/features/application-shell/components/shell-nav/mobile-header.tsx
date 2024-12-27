'use client'

import { GoogleIcon } from '@/components/icons/social-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export const MobileHeader = () => {
  return (
    <div className="border-b min-h-14">
      <Button
        variant="ghost"
        className={cn('flex h-full w-full items-center justify-between')}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <GoogleIcon className="h-4 w-4" />
        </motion.div>
      </Button>
    </div>
  )
}
