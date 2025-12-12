import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    // Allow images from Supabase Storage
    remotePatterns: [
      {
        protocol: "https",
        hostname: "okpdetusefuwkxiksksc.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
      // Add common image hosting services
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**.imgur.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.pexels.com",
      },
      // Allow all HTTPS domains for development
      // Remove this in production and add specific domains above
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Enable image optimization with modern formats
    formats: ["image/avif", "image/webp"],
    // Image quality levels (must include all qualities used in components)
    qualities: [75, 85, 90, 95],
    // Responsive image sizes for different devices
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache time (in seconds) - 60 seconds for frequently changing images
    minimumCacheTTL: 60,
    // Allow unoptimized images for external domains not in remotePatterns
    // This helps during development - restrict in production
    unoptimized: false,
    // Enable dangerous allow all for development (remove in production)
    // In production, add specific domains to remotePatterns above
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
