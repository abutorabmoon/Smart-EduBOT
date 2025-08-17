/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/favicon.ico",
      },
    ],
  },

  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
