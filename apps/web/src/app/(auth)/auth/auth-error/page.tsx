'use client';

import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';

const AuthErrorContent = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
    >
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Authentication Error
        </h1>
      </div>
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button asChild>
        <Link href="/login">Back to Login</Link>
      </Button>
    </motion.div>
  );
};

const AuthError = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
};

export default function AuthErrorPage() {
  return (
    <div className="container relative flex h-full flex-col items-center justify-center">
      <AuthError />
    </div>
  );
}
