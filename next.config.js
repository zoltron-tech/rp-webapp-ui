/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "https://rf5frpnl-3000.euw.devtunnels.ms/",
        "localhost:3000",
        "localhost:4200",
      ],
    },
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },

  env: {
    NOVE_ENV: process.env.NODE_ENV,
    DISABLE_AUTOSCROLL: process.env.DISABLE_AUTOSCROLL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    RP_CHAT_URL: process.env.RP_CHAT_URL,
    RP_LOGIN_URL: process.env.RP_LOGIN_URL,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
      RP_SERVICE_URL: process.env.RP_SERVICE_URL,
  },

  serverRuntimeConfig: {
    RP_SERVICE_URL: process.env.RP_SERVICE_URL,
    USE_LOCAL_DOMAIN: process.env.USE_LOCAL_DOMAIN,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
