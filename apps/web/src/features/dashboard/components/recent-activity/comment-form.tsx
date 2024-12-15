import { motion } from 'motion/react'
import { Paperclip } from 'lucide-react'
import { cva } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { itemVariants, itemContentVariants } from './animations'

type CommentFormProps = {
  newComment: string
  isSubmitting: boolean
  onCommentChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
}

const formVariants = cva('mt-6 flex flex-col gap-x-3', {
  variants: {
    state: {
      default: '',
      submitting: 'opacity-75',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

const textareaContainerVariants = cva(
  'overflow-hidden rounded-lg ring-1 ring-muted',
  {
    variants: {
      state: {
        default: 'focus-within:ring-2 focus-within:ring-primary',
        submitting: 'focus-within:ring-1 focus-within:ring-muted',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
)

const textareaVariants = cva(
  'block w-full resize-none border-0 bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0',
  {
    variants: {
      state: {
        default: '',
        submitting: 'cursor-not-allowed opacity-75',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
)

const attachButtonVariants = cva(
  '-m-2.5 flex size-10 items-center justify-center rounded-full',
  {
    variants: {
      state: {
        default: 'text-muted-foreground hover:text-muted-foreground/80',
        submitting: 'text-muted-foreground/50 cursor-not-allowed',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  },
)

export const CommentForm = ({
  newComment,
  isSubmitting,
  onCommentChange,
  onSubmit,
}: CommentFormProps) => {
  const state = isSubmitting ? 'submitting' : 'default'

  return (
    <motion.form
      variants={itemVariants}
      onSubmit={onSubmit}
      className={formVariants({ state })}
    >
      <motion.div variants={itemContentVariants} className="relative flex-auto">
        <div className={textareaContainerVariants({ state })}>
          <label htmlFor="comment" className="sr-only">
            Add your comment
          </label>
          <Textarea
            id="comment"
            name="comment"
            rows={5}
            className={textareaVariants({ state })}
            placeholder="Add your comment..."
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
            <div className="flex items-center space-x-5">
              <motion.button
                variants={itemContentVariants}
                type="button"
                whileHover={!isSubmitting ? { scale: 1.1 } : {}}
                whileTap={!isSubmitting ? { scale: 0.95 } : {}}
                className={attachButtonVariants({ state })}
                disabled={isSubmitting}
              >
                <Paperclip className="size-5" />
                <span className="sr-only">Attach a file</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemContentVariants}>
        <Button
          type="submit"
          variant="default"
          className="ml-auto mt-4 w-full"
          size="sm"
          disabled={isSubmitting || !newComment.trim()}
        >
          Comment
        </Button>
      </motion.div>
    </motion.form>
  )
}
