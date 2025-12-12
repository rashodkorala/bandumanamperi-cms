import type { MDXComponents } from "mdx/types"
import { useMDXComponents as useCustomMDXComponents } from "@/components/docs/mdx-components"

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return useCustomMDXComponents(components)
}

