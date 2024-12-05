import { ChevronDown } from 'lucide-react';
import { BookMarked, CalendarDays, HelpCircle } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const resources = [
  {
    name: 'Help center',
    description: 'Get all of your questions answered',
    href: '#',
    icon: HelpCircle,
  },
  {
    name: 'Guides',
    description: 'Learn how to maximize our platform',
    href: '#',
    icon: BookMarked,
  },
  {
    name: 'Events',
    description: 'See meet-ups and other events near you',
    href: '#',
    icon: CalendarDays,
  },
];

const recentPosts = [
  {
    id: 1,
    title: 'Boost your conversion rate',
    href: '#',
    date: 'Mar 5, 2023',
    datetime: '2023-03-05',
  },
  {
    id: 2,
    title:
      'How to use search engine optimization to drive traffic to your site',
    href: '#',
    date: 'Feb 25, 2023',
    datetime: '2023-02-25',
  },
  {
    id: 3,
    title: 'Improve your customer experience',
    href: '#',
    date: 'Feb 21, 2023',
    datetime: '2023-02-21',
  },
];

type NavMenuProps = {
  label: string;
};

export const NavMenu = ({ label }: NavMenuProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-x-1 text-sm/6 font-semibold text-foreground hover:text-foreground/80">
          <span>{label}</span>
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl p-0 text-sm/6 shadow-lg"
      >
        <div className="p-4">
          {resources.map((item) => (
            <div
              key={item.name}
              className="group relative flex gap-x-6 rounded-lg p-4 hover:bg-muted"
            >
              <div className="mt-1 flex size-11 flex-none items-center justify-center rounded-lg bg-muted group-hover:bg-background">
                <item.icon
                  aria-hidden="true"
                  className="size-6 text-muted-foreground group-hover:text-primary"
                />
              </div>
              <div>
                <a href={item.href} className="font-semibold">
                  {item.name}
                  <span className="absolute inset-0" />
                </a>
                <p className="mt-1 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-muted p-8">
          <div className="flex justify-between">
            <h3 className="text-sm/6 font-semibold text-muted-foreground">
              Recent posts
            </h3>
            <a
              href="#"
              className={cn(
                'text-sm/6 font-semibold text-primary',
                'hover:text-primary/90',
              )}
            >
              See all <span aria-hidden="true">→</span>
            </a>
          </div>
          <ul role="list" className="mt-6 space-y-6">
            {recentPosts.map((post) => (
              <li key={post.id} className="relative">
                <time
                  dateTime={post.datetime}
                  className="block text-xs/6 text-muted-foreground"
                >
                  {post.date}
                </time>
                <a
                  href={post.href}
                  className="block truncate text-sm/6 font-semibold hover:text-foreground/80"
                >
                  {post.title}
                  <span className="absolute inset-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
};
