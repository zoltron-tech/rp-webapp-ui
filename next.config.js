/** @type {import('next').NextConfig} */

const webpack = require('webpack');
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Set to false to test in development
  // Precaching whole page navigations is a production optimization that
  // actively fights dev iteration — it keeps serving an old cached page
  // shell (old script URLs and all) through server restarts and hard
  // refreshes alike. Scope it to production; the SW itself stays on in
  // dev for push-notification testing.
  cacheOnFrontEndNav: process.env.NODE_ENV === 'production',
  aggressiveFrontEndNavCaching: process.env.NODE_ENV === 'production',
  reloadOnOnline: true,
  customWorkerSrc: 'worker',
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Cache proxied images from wsrv.nl with CacheFirst — the URL already
        // encodes dimensions/quality so the same URL always yields the same
        // image. Status 0 covers opaque (no-cors) responses from background-image
        // fetches so they are cached correctly by the service worker.
        urlPattern: /^https:\/\/wsrv\.nl\//,
        handler: 'CacheFirst',
        options: {
          cacheName: 'wsrv-image-cache',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  }
});


const nextConfig = {
  // Local-dev backend proxy: with LOCAL_BACKEND_PROXY=true, Next forwards the
  // two backend context paths to the local Spring services, so the frontend's
  // single RP_SERVICE_URL (set to http://127.0.0.1:3000) reaches both without
  // needing nginx. No-op in production (flag unset → returns []).
  async rewrites() {
    if (process.env.LOCAL_BACKEND_PROXY !== 'true') return [];
    const userService =
      process.env.LOCAL_USER_SERVICE_URL || 'http://127.0.0.1:50100';
    const portfolioService =
      process.env.LOCAL_PORTFOLIO_SERVICE_URL || 'http://127.0.0.1:50200';
    return [
      { source: '/rp/user/:path*', destination: `${userService}/rp/user/:path*` },
      {
        source: '/rp/portfolio/:path*',
        destination: `${portfolioService}/rp/portfolio/:path*`,
      },
    ];
  },

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
