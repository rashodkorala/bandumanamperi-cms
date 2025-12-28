/**
 * Utility functions for rendering page content
 */

export interface PageContent {
  content: string
  contentType: "html" | "markdown" | "json"
}

/**
 * Render HTML content
 */
export function renderHTML(content: string) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />
}

/**
 * Render Markdown content
 * 
 * NOTE: This is a basic implementation. For full markdown support, install:
 * pnpm add react-markdown remark-gfm rehype-raw
 * 
 * Then replace this function with a proper ReactMarkdown component.
 */
export function renderMarkdown(content: string) {
  // Basic markdown rendering (you can enhance this or use react-markdown)
  // This is a fallback that shows the raw markdown
  return (
    <div className="whitespace-pre-wrap font-sans">
      <div className="text-sm text-muted-foreground mb-4 p-4 bg-muted rounded-md">
        📝 This is displaying raw Markdown. For formatted rendering, install:{" "}
        <code className="bg-background px-2 py-1 rounded">
          pnpm add react-markdown remark-gfm rehype-raw
        </code>
      </div>
      <div className="prose dark:prose-invert max-w-none">{content}</div>
    </div>
  )
}

/**
 * Enhanced Markdown rendering with react-markdown (optional)
 * Uncomment this after installing dependencies
 */
/*
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export function renderMarkdown(content: string) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold mb-3 mt-8">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-bold mb-2 mt-6">{children}</h3>
        ),
        p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary hover:underline"
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-4 space-y-2">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic my-4">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className
          return isInline ? (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code className={`block bg-muted p-4 rounded-lg overflow-auto ${className}`}>
              {children}
            </code>
          )
        },
        pre: ({ children }) => (
          <pre className="bg-muted p-4 rounded-lg overflow-auto mb-4">
            {children}
          </pre>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt || ""}
            className="w-full h-auto rounded-lg my-4"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
*/

/**
 * Render JSON content (for debugging or structured display)
 */
export function renderJSON(content: string) {
  try {
    const parsed = JSON.parse(content)
    return (
      <pre className="bg-muted p-4 rounded-lg overflow-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    )
  } catch {
    return (
      <div className="text-destructive">
        Invalid JSON content
      </div>
    )
  }
}

/**
 * Main render function that chooses the appropriate renderer
 */
export function renderPageContent({ content, contentType }: PageContent) {
  switch (contentType) {
    case "html":
      return renderHTML(content)
    case "markdown":
      return renderMarkdown(content)
    case "json":
      return renderJSON(content)
    default:
      return <div>{content}</div>
  }
}

/**
 * Fetch and parse page file from URL
 */
export async function fetchPageFile(
  url: string,
  type: "markdown" | "json"
): Promise<string | object> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} file`)
  }

  if (type === "json") {
    return response.json()
  }
  return response.text()
}



