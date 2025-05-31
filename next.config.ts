import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'development'
        ? false
        : {
            exclude: ['error', 'warn', 'info'],
          },
  },
  /* config options here */
}

export default nextConfig
