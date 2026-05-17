/** @type {import('next').NextConfig} */

const webpack = require('webpack');
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Set to false to test in development
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  customWorkerSrc: 'worker',
  workboxOptions: {
    disableDevLogs: true,
  }
});


const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing (e.g. script injection via image uploads)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Disallow embedding in iframes from other origins (clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Restrict referrer information sent to external sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict access to sensitive device features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

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
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
  },

  serverRuntimeConfig: {
    RP_SERVICE_URL: process.env.RP_SERVICE_URL,
    USE_LOCAL_DOMAIN: process.env.USE_LOCAL_DOMAIN,
    KLIPY_API_KEY: process.env.KLIPY_API_KEY,
    RP_BUCKET_NAME: process.env.RP_BUCKET_NAME,
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

  webpack: (config, { isServer }) => {
    // nsfwjs bundles ~25MB of pre-built model shards under nsfwjs/dist/models
    // that use a non-standard 2-arg require(name, version) JSONP wrapper that
    // webpack cannot statically analyse. We don't need them bundled — the
    // model is fetched from a CDN at runtime (see src/lib/nsfw-model.ts).
    // Strip them from the module graph entirely.
    const path = require("path");
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          if (!resource || !context) return false;
          if (!/nsfwjs/.test(context)) return false;
          try {
            const resolved = path.resolve(context, resource);
            return /[\\/]nsfwjs[\\/]dist[\\/]models[\\/]/.test(resolved);
          } catch {
            return false;
          }
        },
      }),
    );

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { message: /Cannot statically analyse/ },
      { module: /node_modules[\\/].*nsfwjs/ },
      { module: /node_modules[\\/].*@tensorflow/ },
    ];

    // Don't bundle these heavy ML packages on the server — they're client-only.
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        "nsfwjs",
        "@tensorflow/tfjs",
      ];
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);
