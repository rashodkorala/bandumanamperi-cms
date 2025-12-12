# Image Optimization Guide

This CMS includes comprehensive image optimization to handle large image files and ensure fast loading times.

## Features

### 1. **Next.js Image Optimization**
- Automatic format conversion (WebP, AVIF)
- Responsive image sizing
- Lazy loading by default
- Blur placeholder support
- Built-in performance optimizations

### 2. **Supabase Storage Integration**
- Automatic image transformations via Supabase Storage API
- On-the-fly resizing and format conversion
- Quality optimization
- CDN delivery

### 3. **OptimizedImage Component**
A custom component (`components/ui/optimized-image.tsx`) that:
- Automatically optimizes images
- Shows loading states
- Handles errors gracefully
- Supports responsive sizing
- Works with both Supabase Storage and external URLs

## Usage

### Basic Usage

```tsx
import { OptimizedImage } from "@/components/ui/optimized-image"

<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={85}
/>
```

### With Fill (for responsive containers)

```tsx
<div className="relative aspect-square">
  <OptimizedImage
    src={photo.imageUrl}
    alt={photo.title}
    fill
    quality={85}
    objectFit="cover"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  />
</div>
```

## Configuration

### Next.js Config (`next.config.ts`)

The configuration includes:
- **Remote Patterns**: Allowed image domains
- **Formats**: AVIF and WebP for modern browsers
- **Device Sizes**: Responsive breakpoints
- **Cache TTL**: Minimum cache time

### Adding Custom Image Domains

To allow images from additional domains, add them to `next.config.ts`:

```typescript
remotePatterns: [
  {
    protocol: "https",
    hostname: "your-domain.com",
    pathname: "/images/**",
  },
]
```

## Supabase Storage Optimization

If you're using Supabase Storage, images are automatically optimized using their transformation API:

```
Original: https://project.supabase.co/storage/v1/object/public/photos/image.jpg
Optimized: https://project.supabase.co/storage/v1/object/public/photos/image.jpg?width=800&quality=80&format=webp
```

### Transformation Parameters

- `width`: Image width in pixels
- `height`: Image height in pixels (optional)
- `quality`: 1-100 (default: 80)
- `format`: webp, avif, jpg, png
- `resize`: cover, contain, fill

## Performance Tips

### 1. **Use Appropriate Sizes**
Always specify `sizes` attribute for responsive images:
```tsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
```

### 2. **Set Quality Appropriately**
- **Thumbnails**: 60-70
- **Gallery images**: 75-85
- **Featured/hero images**: 85-95

### 3. **Use Priority for Above-the-Fold Images**
```tsx
<OptimizedImage
  src={heroImage}
  alt="Hero"
  priority
  fill
/>
```

### 4. **Lazy Load Below-the-Fold Images**
By default, images are lazy-loaded. Only use `priority` for critical images.

## Image Upload Best Practices

### Recommended Image Specifications

- **Format**: JPEG for photos, PNG for graphics with transparency
- **Max Dimensions**: 4000x4000px (will be optimized automatically)
- **File Size**: Keep originals under 10MB (optimization handles the rest)
- **Aspect Ratios**: Maintain consistent ratios for galleries

### Using Supabase Storage (Recommended)

1. Upload images to Supabase Storage
2. Get the public URL
3. The system automatically optimizes on display

### Using External URLs

External URLs work but won't benefit from Supabase transformations. Next.js will still optimize them.

## Monitoring Performance

### Check Image Loading

1. Open browser DevTools
2. Go to Network tab
3. Filter by "Img"
4. Check:
   - File sizes (should be optimized)
   - Formats (should be WebP/AVIF)
   - Loading times

### Lighthouse Scores

Image optimization should improve:
- **Performance Score**: Faster page loads
- **Largest Contentful Paint (LCP)**: Faster image rendering
- **Cumulative Layout Shift (CLS)**: Stable layouts with proper sizing

## Troubleshooting

### Images Not Loading

1. Check if domain is in `next.config.ts` remotePatterns
2. Verify image URL is accessible
3. Check browser console for errors

### Images Not Optimizing

1. Ensure you're using `OptimizedImage` component
2. Check Next.js Image optimization is enabled
3. Verify image format is supported (JPEG, PNG, WebP)

### Large File Sizes

1. Use Supabase Storage transformations
2. Lower quality setting (70-80 for thumbnails)
3. Ensure responsive sizes are set correctly

## Advanced: Custom Image Proxy

For maximum control, you can set up a custom image proxy:

```typescript
// lib/utils/image-optimization.ts
export function getOptimizedImageUrl(url: string, options) {
  // Your custom proxy logic
  return `https://your-proxy.com/image?url=${encodeURIComponent(url)}&${params}`
}
```

## Best Practices Summary

✅ **Do:**
- Use `OptimizedImage` component
- Set appropriate `sizes` for responsive images
- Use `priority` only for above-the-fold images
- Store images in Supabase Storage when possible
- Use appropriate quality settings

❌ **Don't:**
- Use regular `<img>` tags
- Skip `sizes` attribute
- Use `priority` for all images
- Upload extremely large files (>20MB)
- Forget to add domains to `next.config.ts`

