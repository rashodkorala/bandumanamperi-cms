import { CodeBlock } from "./code-block"
import { Alert, AlertDescription, AlertTitle } from "./alert"
import type { MDXComponents } from "mdx/types"

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    h1: ({ children, ...props }) => (
      <h1 id={slugify(children)} className="text-4xl font-bold tracking-tight mb-4 scroll-mt-24" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 id={slugify(children)} className="text-2xl font-semibold mb-4 mt-8 scroll-mt-24" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 id={slugify(children)} className="text-xl font-semibold mb-3 mt-6 scroll-mt-24" {...props}>
        {children}
      </h3>
    ),
    code: ({ children, className, ...props }) => {
      const isInline = !className
      if (isInline) {
        return (
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
            {children}
          </code>
        )
      }
      const language = className?.replace("language-", "") || ""
      return <CodeBlock code={String(children).trim()} language={language} />
    },
    pre: ({ children, ...props }) => {
      return <>{children}</>
    },
    ul: ({ children, ...props }) => (
      <ul className="my-4 ml-6 list-disc [&>li]:mt-2 [&>li>p]:mt-0" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="my-4 ml-6 list-decimal [&>li]:mt-2 [&>li>p]:mt-0" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="pl-2" {...props}>
        {children}
      </li>
    ),
    Alert,
    AlertTitle,
    AlertDescription,
    CodeBlock,
    ...components,
  }
}

function slugify(text: React.ReactNode): string {
  const str = String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
  return str || "heading"
}

