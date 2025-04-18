/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "**twimg.com",
      },
      // 以下は追加
      {
        protocol: "https",
        hostname: "www.digdao.jp",
      },
      {
        protocol: "https",
        hostname: "i.gyazo.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      }
    ],
  },
}

module.exports = nextConfig
