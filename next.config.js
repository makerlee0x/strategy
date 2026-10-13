/** @type {import('next').NextConfig} */
const sec = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];
module.exports = {
  poweredByHeader: false,
  images: { unoptimized: true },
  async headers() {
    return [
      { source: '/(.*)', headers: sec },
      { source: '/:file(strategy-icon.png|strategy-wordmark.png)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }] }
    ];
  }
};
