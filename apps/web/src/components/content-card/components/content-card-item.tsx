'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { type ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { itemVariants } from '../animations/content-card-animations';
import { useContentCard } from '../context/content-card-context';

const contentCardItemVariants = cva('flex items-center', {
  variants: {
    layout: {
      default: 'justify-between',
      stacked: 'flex-col items-start',
      centered: 'justify-center',
      reversed: 'flex-row-reverse justify-between',
    },
    spacing: {
      default: 'gap-4',
      tight: 'gap-2',
      loose: 'gap-6',
      none: 'gap-0',
    },
    size: {
      default: '',
      sm: '[&>div]:space-y-0.5 [&>div>div]:text-sm',
      lg: '[&>div]:space-y-1.5 [&>div>div]:text-lg',
    },
    contentWidth: {
      default: '',
      full: '[&>div:first-child]:w-full',
      auto: '[&>div:first-child]:w-auto',
    },
  },
  defaultVariants: {
    layout: 'default',
    spacing: 'default',
    size: 'default',
    contentWidth: 'default',
  },
});

export interface ContentCardItemProps
  extends VariantProps<typeof contentCardItemVariants> {
  id?: string;
  label?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  parentId?: string;
}

export const ContentCardItem = ({
  id,
  label = '',
  description = '',
  action,
  children,
  className,
  contentClassName,
  layout,
  spacing,
  size,
  contentWidth,
  parentId,
}: ContentCardItemProps) => {
  const { filteredItems, registerItem } = useContentCard();

  const doesMatchItems =
    !filteredItems.length || filteredItems.some((item) => item.id === id);

  useEffect(() => {
    if (id) {
      console.log('registering item', id, label, description, parentId);
      registerItem(id, { id, label, description, parentId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <AnimatePresence mode="popLayout">
      {(!filteredItems.length || doesMatchItems) && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="show"
          exit="hidden"
          className={cn(
            contentCardItemVariants({
              layout,
              spacing,
              size,
              contentWidth,
            }),
            className,
          )}
          role="listitem"
          aria-label={label}
        >
          <div className={cn('space-y-1 w-full', contentClassName)}>
            <div className="font-medium" role="heading" aria-level={3}>
              {label}
            </div>
            {description && (
              <p
                className="text-sm text-muted-foreground"
                id={`${id}-description`}
              >
                {description}
              </p>
            )}
            {children}
          </div>
          {action && (
            <div
              className="flex-shrink-0"
              role="group"
              aria-label="Item actions"
            >
              {action}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
