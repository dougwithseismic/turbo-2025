import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ActivityItemProps } from './types';
import { itemVariants, itemContentVariants } from './animations';

const activityItemVariants = cva(
  'relative flex  gap-x-4 w-full group transition-opacity duration-200',
  {
    variants: {
      type: {
        default: '',
        commented: '',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
);

const activityContentVariants = cva(
  'flex-auto rounded-md w-full p-3 ring-1 ring-inset ring-muted',
  {
    variants: {
      type: {
        default: '',
        commented: '',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
);

const activityTextVariants = cva(
  'py-0.5 text-xs leading-5 text-muted-foreground',
  {
    variants: {
      type: {
        default: '',
        commented: '',
      },
    },
    defaultVariants: {
      type: 'default',
    },
  },
);

export const ActivityItem = ({ item, onDelete }: ActivityItemProps) => {
  if (item.type === 'commented') {
    return (
      <motion.li
        variants={itemVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        layout
        className={activityItemVariants({ type: 'commented' })}
      >
        <motion.img
          variants={itemContentVariants}
          src={item.person.imageUrl}
          alt=""
          className="relative size-6 flex-none rounded-full bg-muted/5"
        />
        <motion.div
          variants={itemContentVariants}
          layout
          className={activityContentVariants({ type: 'commented' })}
        >
          <div className="flex justify-between gap-x-4">
            <motion.div
              variants={itemContentVariants}
              className={activityTextVariants({ type: 'commented' })}
            >
              <span className="font-medium text-foreground">
                {item.person.name}
              </span>{' '}
              commented
            </motion.div>
            <motion.time
              variants={itemContentVariants}
              dateTime={item.dateTime}
              className="flex-none py-0.5 text-xs ml-auto leading-5 text-muted-foreground"
            >
              {item.date}
            </motion.time>
          </div>
          <motion.p
            variants={itemContentVariants}
            className="text-sm leading-6 text-muted-foreground"
          >
            {item.comment}
          </motion.p>
        </motion.div>
        <DeleteButton onDelete={() => onDelete(item.id)} />
      </motion.li>
    );
  }

  return (
    <motion.li
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      layout
      className={activityItemVariants({ type: 'default' })}
    >
      <motion.div
        variants={itemContentVariants}
        layout
        className="relative flex size-6 flex-none items-center justify-center"
      >
        {item.type === 'paid' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <CheckCircle className="size-6 text-primary" />
          </motion.div>
        )}
      </motion.div>
      <motion.p
        variants={itemContentVariants}
        className={activityTextVariants({ type: 'default' })}
      >
        <span className="font-medium text-foreground">{item.person.name}</span>{' '}
        {item.type} the invoice
      </motion.p>
      <motion.time
        variants={itemContentVariants}
        dateTime={item.dateTime}
        className="flex-none py-0.5 text-xs leading-5 ml-auto text-muted-foreground"
      >
        {item.date}
      </motion.time>
      <DeleteButton onDelete={() => onDelete(item.id)} className="" />
    </motion.li>
  );
};

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
);

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
);
