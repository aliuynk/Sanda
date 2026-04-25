/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@sanda/api',
    '@sanda/core',
    '@sanda/db',
    '@sanda/ui-web',
    '@sanda/validation',
  ],
};

export default nextConfig;
