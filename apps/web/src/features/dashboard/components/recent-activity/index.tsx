'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ActivityItem as ActivityItemComponent } from './activity-item';
import { CommentForm } from './comment-form';
import { ActivityItem, ActivityType } from './types';
import { containerVariants, itemVariants, listVariants } from './animations';
import { ContentCardEmptyState } from '@/components/content-card/components/content-card-empty-state';
import { cn } from '@/lib/utils';

const initialActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'created' as ActivityType,
    person: { name: 'Chelsea Hagon' },
    date: '7d ago',
    dateTime: '2023-01-23T10:32',
  },
  {
    id: 2,
    type: 'edited' as ActivityType,
    person: { name: 'Chelsea Hagon' },
    date: '6d ago',
    dateTime: '2023-01-23T11:03',
  },
  {
    id: 3,
    type: 'sent' as ActivityType,
    person: { name: 'Chelsea Hagon' },
    date: '6d ago',
    dateTime: '2023-01-23T11:24',
  },
  {
    id: 4,
    type: 'commented' as ActivityType,
    person: {
      name: 'Chelsea Hagon',
      imageUrl:
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    comment:
      'Called client, they reassured me the invoice would be paid by the 25th.',
    date: '3d ago',
    dateTime: '2023-01-23T15:56',
  },
  {
    id: 5,
    type: 'viewed' as ActivityType,
    person: { name: 'Alex Curren' },
    date: '2d ago',
    dateTime: '2023-01-24T09:12',
  },
  {
    id: 6,
    type: 'paid' as ActivityType,
    person: { name: 'Alex Curren' },
    date: '1d ago',
    dateTime: '2023-01-24T09:20',
  },
].reverse();

export const RecentActivity = () => {
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newActivity: ActivityItem = {
        id: Date.now(),
        type: 'commented',
        person: {
          name: 'Current User',
          imageUrl:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
        comment: newComment,
        date: 'just now',
        dateTime: new Date().toISOString(),
      };

      setActivity([...activity, newActivity]);
      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    setActivity(activity.filter((item) => item.id !== id));
    toast({
      title: 'Item deleted',
      variant: 'destructive',
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.ul role="list" className="space-y-6" variants={listVariants}>
        <AnimatePresence mode="popLayout" initial={false}>
          {activity.map((activityItem) => (
            <ActivityItemComponent
              key={activityItem.id}
              item={activityItem}
              onDelete={handleDelete}
            />
          ))}
          {activity.length === 0 && (
            <motion.div
              variants={itemVariants}
              className={cn(
                'flex flex-col items-center justify-center py-1 text-center',
              )}
              role="status"
              aria-live="polite"
            >
              <h3 className="font-semibold">No activity found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Why not write a comment?
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.ul>

      <CommentForm
        newComment={newComment}
        isSubmitting={isSubmitting}
        onCommentChange={setNewComment}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
};
