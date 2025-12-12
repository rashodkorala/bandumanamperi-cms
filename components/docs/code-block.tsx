"use client"

import { useState, Children } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code?: string
  language?: string
  filename?: string
  children?: React.ReactNode
}

export function CodeBlock({ code, language, filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Extract code string from children or use code prop
  const extractCode = (): string => {
    if (code) return code
    if (!children) return ''

    // Use React.Children to properly extract text from children
    const textContent = Children.toArray(children)
      .map(child => {
        if (typeof child === 'string') return child
        if (typeof child === 'number') return String(child)
        // For React elements, try to extract text content
        if (child && typeof child === 'object' && 'props' in child) {
          const props = child.props as { children?: React.ReactNode }
          return Children.toArray(props?.children || []).join('')
        }
        return String(child)
      })
      .join('')
      .trim()

    return textContent
  }

  const codeContent = extractCode()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group py-4">
      {filename && (
        <div className="px-4 py-2 bg-muted border-b text-sm font-mono text-muted-foreground">
          {filename}
        </div>
      )}
      <div className="relative">
        <pre className={cn(
          "overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm",
          filename && "rounded-t-none"
        )}>
          <code className={cn("text-[#d4d4d4]", language && `language-${language}`)}>
            {codeContent}
          </code>
        </pre>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? (
            <IconCheck className="h-4 w-4" />
          ) : (
            <IconCopy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

