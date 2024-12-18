import type { MDXComponents } from 'mdx/types'
import { Alert } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
    p: ({ children }) => (
      <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
    ),
    li: ({ children }) => <li className="mt-2">{children}</li>,
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <Alert className="my-6 border-l-4">
        <div className="[&>p]:mt-0">{children}</div>
      </Alert>
    ),
    code: ({
      className,
      children,
      ...props
    }: {
      className?: string
      children: React.ReactNode
    }) => {
      const match = /language-(\w+)/.exec(className ?? '')
      const language = match ? match[1] : ''

      if (!className) {
        return (
          <code
            className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm"
            {...props}
          >
            {children}
          </code>
        )
      }

      return (
        <Card className="my-6 overflow-hidden">
          <div className="flex items-center gap-2 bg-muted px-4 py-2">
            <Badge variant="secondary">{language || 'Code'}</Badge>
          </div>
          <pre className="overflow-x-auto p-4">
            <code className="relative rounded font-mono text-sm">
              {children}
            </code>
          </pre>
        </Card>
      )
    },
    a: ({ href, children }) => {
      const safeHref =
        href?.startsWith('http') || href?.startsWith('/') ? href : '#'
      return (
        <Link
          href={safeHref}
          className="font-medium text-primary underline underline-offset-4 hover:no-underline"
          {...(href?.startsWith('http')
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {children}
        </Link>
      )
    },
    hr: () => <Separator className="my-4" />,
    img: ({ src, alt }) => (
      <div className="relative my-8 aspect-video w-full overflow-hidden rounded-lg">
        <img src={src || ''} alt={alt || ''} className="object-cover" />
      </div>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full border-collapse border border-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-border bg-muted px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
        {children}
      </td>
    ),
    ...components,
  }
}
