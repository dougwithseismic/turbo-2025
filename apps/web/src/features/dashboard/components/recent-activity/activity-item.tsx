import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ActivityItemProps } from './types'
import { itemVariants, itemContentVariants } from './animations'
import Link from 'next/link'

const activityItemVariants = cva(
  'relative flex gap-x-4 w-full group transition-opacity duration-200',
  {
    variants: {
      type: {
        default: '',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
)

const activityContentVariants = cva(
  'flex-auto rounded-md w-full p-3 ring-1 ring-inset ring-muted',
  {
    variants: {
      type: {
        default: '',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
)

export const ActivityItem = ({ item, onDelete }: ActivityItemProps) => {
  return (
    <motion.li
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      className={activityItemVariants()}
    >
      <motion.div
        variants={itemContentVariants}
        layout
        className={activityContentVariants()}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Link
              href={item.href}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {item.label} →
            </Link>
            <motion.time
              variants={itemContentVariants}
              dateTime={item.dateTime}
              className="flex-none text-xs leading-5 text-muted-foreground"
            >
              {item.date}
            </motion.time>
          </div>
          <motion.div variants={itemContentVariants}>{item.value}</motion.div>
        </div>
      </motion.div>
      <DeleteButton onDelete={() => onDelete(item.id)} />
    </motion.li>
  )
}

const deleteButtonVariants = cva(
  'opacity-0 group-hover:opacity-100 transition-opacity',
  {
    variants: {
      intent: {
        default: 'text-muted-foreground hover:text-destructive',
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  },
)

const DeleteButton = ({
  onDelete,
  ...motionProps
}: { onDelete: () => void } & React.ComponentProps<typeof motion.button>) => (
  <motion.button
    variants={itemContentVariants}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={onDelete}
    className={deleteButtonVariants()}
    {...motionProps}
  >
    <X className="size-4" />
  </motion.button>
)
