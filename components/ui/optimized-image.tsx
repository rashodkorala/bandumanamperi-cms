"use client"

import { useState } from "react"
import Image from "next/image"
import { getOptimizedImageUrl, getResponsiveSizes } from "@/lib/utils/image-optimization"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  fill?: boolean
  sizes?: string
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  fill = false,
  sizes,
  objectFit = "cover",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate optimized URL
  const optimizedSrc = getOptimizedImageUrl(src, {
    width: width || 1200,
    height: height,
    quality,
    format: "webp",
  })

  // Default sizes for responsive images
  const defaultSizes = sizes || getResponsiveSizes({
    mobile: 400,
    tablet: 800,
    desktop: 1200,
    large: 1600,
  })

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-sm">Failed to load image</span>
      </div>
    )
  }

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        {isLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <Image
          src={optimizedSrc}
          alt={alt}
          fill
          sizes={defaultSizes}
          quality={quality}
          priority={priority}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            objectFit === "none" && "object-none",
            objectFit === "scale-down" && "object-scale-down"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    )
  }

  if (!width || !height) {
    console.warn("OptimizedImage: width and height are required when fill is false")
    return null
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={defaultSizes}
        quality={quality}
        priority={priority}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down"
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

