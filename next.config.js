const path = require("path");

module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    config.resolve.alias[".prisma/client"] = path.resolve(
      __dirname,
      "node_modules/.prisma/client"
    );

    return config;
  },  // Optimize CSS loading
  optimizeFonts: true,
  swcMinify: true,  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    domains: ['images.unsplash.com', 'placehold.co', 'www.radioomusic.com', 'radioomusic.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'production' ? true : false, // Disable optimization in production to ensure static file reference works
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },
  // Add this to explicitly allow all hosts
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' }
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=31536000' }
        ],
      },
      {
        // Set no-cache headers for all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ],
      },
      {
        // Specific no-cache headers for background images API
        source: '/api/background-images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ],
      }
    ];
  },
  typescript: {
    // This setting allows production builds to successfully complete even if
    // your project has type errors
    ignoreBuildErrors: true,
  },
};