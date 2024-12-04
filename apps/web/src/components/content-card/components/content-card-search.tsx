'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useContentCard } from '../context/content-card-context';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { itemVariants } from '../animations/content-card-animations';

const contentCardSearchVariants = cva('relative flex items-center', {
  variants: {
    size: {
      default: '[&>input]:h-10',
      sm: '[&>input]:h-8 [&>svg]:top-2',
      lg: '[&>input]:h-12 [&>svg]:top-4',
    },
    iconPosition: {
      left: '[&>svg]:left-3 [&>input]:pl-9',
      right: '[&>svg]:right-3 [&>input]:pr-9',
      none: '',
    },
  },
  defaultVariants: {
    size: 'default',
    iconPosition: 'left',
  },
});

export interface ContentCardSearchProps
  extends VariantProps<typeof contentCardSearchVariants> {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export const ContentCardSearch = ({
  placeholder = 'Search...',
  className,
  inputClassName,
  size,
  iconPosition = 'left',
}: ContentCardSearchProps) => {
  const { searchQuery, setSearchQuery, filteredItems } = useContentCard();
  console.log(filteredItems);

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="show"
      className={cn(
        contentCardSearchVariants({ size, iconPosition }),
        className,
      )}
      role="search"
    >
      {iconPosition !== 'none' && (
        <Search
          className="absolute h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <Input
        placeholder={placeholder}
        className={cn(
          inputClassName,
          filteredItems.length === 0 &&
            'border-red-600 ring-1 ring-red-600 focus-visible:ring-red-600',
        )}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label="Search content"
        type="search"
      />
    </motion.div>
  );
};
