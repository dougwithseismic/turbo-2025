import { MDXComponents } from 'mdx/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export const mdxComponents: MDXComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mb-4">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-4">
      {children}
    </h4>
  ),

  // Text elements
  p: ({ children }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">{children}</p>
  ),
  a: ({ href, children }) => (
    <Link
      href={href ?? '#'}
      className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
    >
      {children}
    </Link>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,

  // Lists
  ul: ({ children }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,

  // Block elements
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
  ),
  hr: () => <Separator className="my-8" />,

  // Code blocks
  pre: ({ children }) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-black py-4 dark:bg-zinc-900">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
      {children}
    </code>
  ),

  // Custom components
  Card: ({ title, children }) => (
    <Card className="my-6">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  ),
  Alert: ({ title, children }) => (
    <Alert className="my-6">
      {title && <AlertDescription>{title}</AlertDescription>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  ),
  Badge: ({ variant = 'default', children }) => (
    <Badge variant={variant} className="mx-1">
      {children}
    </Badge>
  ),
  Button: ({ variant = 'default', children, ...props }) => (
    <Button variant={variant} {...props}>
      {children}
    </Button>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full border-collapse border">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b transition-colors hover:bg-muted/50">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border px-4 py-2 text-left font-bold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border px-4 py-2 text-left">{children}</td>
  ),
}
