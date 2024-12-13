'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CloseNotificationContent = () => {
  const searchParams = useSearchParams();
  const message =
    searchParams.get('message') ?? 'Sorted - You can close this window now';
  const type = searchParams.get('type') === 'error' ? 'error' : 'success';

  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    window.close();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
    >
      <div className="flex flex-col space-y-2 text-center">
        <h1
          className={cn(
            'text-2xl font-semibold tracking-tight',
            type === 'error' && 'text-destructive',
          )}
        >
          {message}
        </h1>
        <p className="text-sm text-muted-foreground">
          This window will close automatically in 3 seconds
        </p>
      </div>
      <Button
        onClick={handleClose}
        variant={type === 'error' ? 'destructive' : 'default'}
      >
        Close Now
      </Button>
    </motion.div>
  );
};

export default function CloseNotificationPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center p-8">
      <CloseNotificationContent />
    </div>
  );
}
