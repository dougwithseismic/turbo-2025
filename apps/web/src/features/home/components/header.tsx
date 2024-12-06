import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavMenu, navigation } from './nav-menu';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';

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
                      <Button asChild className="w-full" variant="secondary">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full" variant="secondary">
                        <Link href="/login">Log in</Link>
                      </Button>
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
            <Button asChild variant="default">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
};
