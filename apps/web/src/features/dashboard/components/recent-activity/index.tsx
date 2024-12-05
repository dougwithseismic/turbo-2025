'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'completed' | 'in-progress';

const statuses: Record<Status, string> = {
  pending: 'text-gray-500 bg-gray-100/10',
  completed: 'text-green-400 bg-green-400/10',
  'in-progress': 'text-blue-400 bg-blue-400/10',
};

const priorities = {
  required: 'text-rose-400 bg-rose-400/10 ring-rose-400/30',
  optional: 'text-gray-400 bg-gray-400/10 ring-gray-400/20',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

type OnboardingTask = {
  id: number;
  href: string;
  taskName: string;
  description: string;
  status: Status;
  statusText: string;
  priority: keyof typeof priorities;
};

const onboardingTasks: OnboardingTask[] = [
  {
    id: 1,
    href: '/account/api-keys',
    taskName: 'Generate API Key',
    description: 'Create your first API key to start integrating',
    status: 'pending',
    statusText: 'Not started',
    priority: 'required',
  },
  {
    id: 2,
    href: '/account',
    taskName: 'Update Your Email Address',
    description: 'Add your email address to your account',
    status: 'in-progress',
    statusText: 'Started 5m ago',
    priority: 'required',
  },
  {
    id: 3,
    href: '/maintenance',
    taskName: 'Visit Maintenance Page',
    description:
      'The maintenance page lets users know when the platform is under maintenance.',
    status: 'completed',
    statusText: 'Completed 1h ago',
    priority: 'optional',
  },
  {
    id: 4,
    href: '/webhooks',
    taskName: 'Configure Webhooks',
    description: 'Set up notifications for important events',
    status: 'pending',
    statusText: 'Not started',
    priority: 'optional',
  },
];

export const RecentActivity = () => {
  return (
    <motion.ul
      role="list"
      className="divide-y divide-white/5"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {onboardingTasks.map((task) => (
        <motion.li
          key={task.id}
          variants={itemVariants}
          className="relative flex items-center space-x-4 py-4"
        >
          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-3">
              <div
                className={cn(
                  statuses[task.status],
                  'flex-none rounded-full p-1',
                )}
              >
                <div className="size-2 rounded-full bg-current" />
              </div>
              <h2 className="min-w-0 text-sm/6 font-semibold">
                <a href={task.href} className="flex gap-x-2">
                  <span className="truncate">{task.taskName}</span>
                  <span className="absolute inset-0" />
                </a>
              </h2>
            </div>
            <div className="mt-3 flex items-center gap-x-2.5 text-xs/5 text-muted-foreground">
              <p className="truncate hidden md:block">{task.description}</p>
              <svg
                viewBox="0 0 2 2"
                className="size-0.5 flex-none fill-muted-foreground"
              >
                <circle r={1} cx={1} cy={1} />
              </svg>
              <p className="whitespace-nowrap">{task.statusText}</p>
            </div>
          </div>
          <div
            className={cn(
              priorities[task.priority],
              'flex-none rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset',
            )}
          >
            {task.priority}
          </div>
          <ChevronRight
            className="size-5 flex-none text-muted-foreground"
            aria-hidden="true"
          />
        </motion.li>
      ))}
    </motion.ul>
  );
};
