/**
 * Image optimization utilities
 * Handles image optimization for Supabase Storage and external URLs
 */

/**
 * Check if URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '') && url.includes('/storage/v1/object/public/')
}

/**
 * Get optimized image URL
 * For Supabase Storage: uses built-in transformations
 * For external URLs: returns as-is (can be enhanced with image proxy)
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpg' | 'png'
    resize?: 'cover' | 'contain' | 'fill'
  } = {}
): string {
  if (!url) return url

  const {
    width = 800,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options

  // If it's a Supabase Storage URL, use their transformation API
  if (isSupabaseStorageUrl(url)) {
    const baseUrl = url.split('?')[0] // Remove existing query params
    const params = new URLSearchParams()
    
    params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    params.set('quality', quality.toString())
    params.set('format', format)
    params.set('resize', resize)
    
    return `${baseUrl}?${params.toString()}`
  }

  // For external URLs, you could use an image proxy service here
  // For now, return as-is (Next.js Image will handle optimization)
  return url
}

/**
 * Get responsive image sizes for different breakpoints
 */
export function getResponsiveSizes(breakpoints: {
  mobile?: number
  tablet?: number
  desktop?: number
  large?: number
} = {}): string {
  const {
    mobile = 400,
    tablet = 800,
    desktop = 1200,
    large = 1600,
  } = breakpoints

  return `(max-width: 640px) ${mobile}px, (max-width: 1024px) ${tablet}px, (max-width: 1280px) ${desktop}px, ${large}px`
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[] = [400, 800, 1200, 1600]
): string {
  return sizes
    .map((size) => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ')
}

