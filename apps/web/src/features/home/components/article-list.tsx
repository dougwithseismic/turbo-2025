import { Badge } from '@/components/ui/badge';

const posts = [
  {
    id: 1,
    title: 'Building Type-Safe APIs with tRPC',
    href: '#',
    description: `Learn how to create end-to-end type-safe APIs using tRPC in your Next.js applications. We'll cover setup, best practices, and advanced patterns.`,
    date: 'Mar 16, 2024',
    datetime: '2024-03-16',
    category: { title: 'Development', href: '#' },
    author: {
      name: 'Michael Foster',
      role: 'Senior Developer',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: 2,
    title: 'Mastering Server Components in Next.js 14',
    href: '#',
    description: `Dive deep into React Server Components and learn how they can improve your application's performance and user experience.`,
    date: 'Mar 14, 2024',
    datetime: '2024-03-14',
    category: { title: 'Performance', href: '#' },
    author: {
      name: 'Sarah Chen',
      role: 'Lead Architect',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
  {
    id: 3,
    title: 'Building Beautiful UIs with Tailwind and shadcn/ui',
    href: '#',
    description:
      'Explore how to create stunning user interfaces by combining the power of Tailwind CSS with the beautiful components from shadcn/ui.',
    date: 'Mar 12, 2024',
    datetime: '2024-03-12',
    category: { title: 'Design', href: '#' },
    author: {
      name: 'Tom Wilson',
      role: 'UI Designer',
      href: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  },
];

export const ArticleList = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-border pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex max-w-xl flex-col items-start justify-between"
            >
              <div className="flex items-center gap-x-4 text-xs">
                <time
                  dateTime={post.datetime}
                  className="text-muted-foreground"
                >
                  {post.date}
                </time>
                <Badge variant="secondary">
                  <a href={post.category.href}>{post.category.title}</a>
                </Badge>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg/6 font-semibold group-hover:text-muted-foreground">
                  <a href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </a>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm/6 text-muted-foreground">
                  {post.description}
                </p>
              </div>
              <div className="relative mt-8 flex items-center gap-x-4">
                <img
                  alt=""
                  src={post.author.imageUrl}
                  className="size-10 rounded-full bg-muted"
                />
                <div className="text-sm/6">
                  <p className="font-semibold">
                    <a href={post.author.href}>
                      <span className="absolute inset-0" />
                      {post.author.name}
                    </a>
                  </p>
                  <p className="text-muted-foreground">{post.author.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
