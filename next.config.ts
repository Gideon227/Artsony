import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Cloudinary images are delivered by src/lib/cloudinary-loader.ts straight
    // from Cloudinary's CDN; every other image goes through the built-in
    // optimizer, so the settings below apply to those.
    loader: 'custom',
    loaderFile: './src/lib/cloudinary-loader.ts',
    formats: ['image/avif', 'image/webp'],
    qualities: [50, 75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
  },
};

export default withNextVideo(nextConfig);
