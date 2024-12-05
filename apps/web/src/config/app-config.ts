export const appConfig = {
  name: 'Your App Name',
  url: process.env.NEXT_PUBLIC_APP_URL,
  env: process.env.NODE_ENV,
  links: {
    github: 'https://github.com/yourusername/yourrepo',
    docs: 'https://docs.yourapp.com',
  },
} as const;
