'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings2, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthCheck } from '../hooks/use-health-check';
import { Metadata } from 'next';

const REDIRECT_COUNTDOWN_SECONDS = 3;

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function MaintenanceCard() {
  const router = useRouter();
  const [redirectCountdown, setRedirectCountdown] = useState(
    REDIRECT_COUNTDOWN_SECONDS,
  );
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [healthStatus, checkHealth] = useHealthCheck();
  const { state, checkCount, nextCheckIn } = healthStatus;

  // Handle countdown
  useEffect(() => {
    if (state !== 'restored') return;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShouldRedirect(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  // Handle redirect separately
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/dashboard');
    }
  }, [shouldRedirect, router]);

  const getStatusMessage = () => {
    if (state === 'checking') return 'Checking...';
    if (checkCount === 0) return 'Check Now';
    return `Check Again (Attempt ${checkCount})`;
  };

  return (
    <Card className="w-full max-w-md space-y-6 p-8 text-center shadow-sm transition-all hover:shadow-md">
      <AnimatePresence mode="wait">
        {state === 'restored' ? (
          <motion.div key="restored" {...fadeInUp} className="space-y-6">
            <div className="relative mx-auto h-24 w-24">
              <CheckCircle2 className="h-full w-full text-green-500" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Service Restored!
              </h1>
              <p className="text-muted-foreground">
                Redirecting you to the dashboard in {redirectCountdown}{' '}
                seconds...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="maintenance" {...fadeInUp} className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Scheduled Maintenance
              </h1>
              <p className="text-muted-foreground">
                We're currently performing system upgrades to improve your
                experience. Our team is working diligently to complete the
                maintenance as quickly as possible.
              </p>
            </div>

            <div className="space-y-4 rounded-lg bg-secondary/50 p-4">
              <h2 className="font-semibold text-foreground">What to expect:</h2>
              <ul className="text-sm text-muted-foreground" role="list">
                <li>• Estimated downtime: 15-30 minutes</li>
                <li>• All your data is safe and secure</li>
                <li>• Service will automatically resume</li>
                {checkCount > 0 && (
                  <li>
                    • Next automatic check in {Math.ceil(nextCheckIn / 1000)}s
                  </li>
                )}
              </ul>
            </div>

            <Button
              onClick={checkHealth}
              disabled={state === 'checking'}
              className="group inline-flex items-center gap-2"
              aria-live="polite"
            >
              <RefreshCcw
                className={`h-4 w-4 transition-transform ${
                  state === 'checking'
                    ? 'animate-spin'
                    : 'group-hover:rotate-180'
                }`}
                aria-hidden="true"
              />
              {getStatusMessage()}
            </Button>

            <p className="text-sm text-muted-foreground">
              If the issue persists, please contact our support team at{' '}
              <a
                href="mailto:support@example.com"
                className="text-primary hover:underline"
                aria-label="Email support at support@example.com"
              >
                support@example.com
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
