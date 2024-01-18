/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mtsdwhzzepzkbnnbsyvo.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
