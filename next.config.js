/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    compiler: {
        styledComponents: true,
    },

    env: {
        NOVE_ENV: process.env.NODE_ENV,
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
