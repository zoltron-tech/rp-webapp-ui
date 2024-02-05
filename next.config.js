/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["https://rf5frpnl-3000.euw.devtunnels.ms/", "localhost:3000"]
    }
  },
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },

    env: {
        NOVE_ENV: process.env.NODE_ENV,
        DISABLE_AUTOSCROLL: process.env.DISABLE_AUTOSCROLL,
    },

    serverRuntimeConfig: {
        RP_SERVICE_URL: process.env.RP_SERVICE_URL
    },

    images: {
        remotePatterns: [
          { 
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '**',
          },
        ],
      },
}

module.exports = nextConfig
