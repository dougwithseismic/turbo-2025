'use client';

import { Menu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavMenu, navigation } from './nav-menu';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavigationButtonProps = {
  href: string;
  children: string;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
};

const useNavigationState = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  return { isNavigating, handleNavigation };
};

const NavigationButton = ({
  href,
  children,
  variant = 'default',
  className,
}: NavigationButtonProps) => {
  const { isNavigating, handleNavigation } = useNavigationState();

  return (
    <Button
      onClick={() => handleNavigation(href)}
      className={className}
      variant={variant}
      disabled={isNavigating}
    >
      {isNavigating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          On the way...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="relative inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img
              alt=""
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
              className="h-8 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-border">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-muted"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="py-6">
                    {user ? (
                      <NavigationButton
                        href="/dashboard"
                        variant="secondary"
                        className="w-full"
                      >
                        Dashboard
                      </NavigationButton>
                    ) : (
                      <NavigationButton
                        href="/login"
                        variant="secondary"
                        className="w-full"
                      >
                        Log in
                      </NavigationButton>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <NavMenu />
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {user ? (
            <NavigationButton href="/dashboard" variant="default">
              Go to Dashboard
            </NavigationButton>
          ) : (
            <NavigationButton href="/login" variant="outline">
              Log in
            </NavigationButton>
          )}
        </div>
      </nav>
    </header>
  );
};
