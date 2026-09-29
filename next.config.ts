import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════
  // IMAGES
  // ═══════════════════════════════════════════════════════════
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // ⭐ OPTIMIZIME IMAGES
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 ditë
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ═══════════════════════════════════════════════════════════
  // PERFORMANCE
  // ═══════════════════════════════════════════════════════════
  experimental: {
    // Optimizime për paketat e mëdha
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@sanity/client',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // COMPRESSION
  // ═══════════════════════════════════════════════════════════
  compress: true,

  // ═══════════════════════════════════════════════════════════
  // PRODUCTION
  // ═══════════════════════════════════════════════════════════
  productionBrowserSourceMaps: false,

  // ═══════════════════════════════════════════════════════════
  // POWERED BY HEADER
  // ═══════════════════════════════════════════════════════════
  poweredByHeader: false,
}

export default nextConfig