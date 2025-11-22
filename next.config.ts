/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tbuqxzhazckilgovvtzm.supabase.co",
        pathname: "/storage/v1/object/public/avatars/**",
      },
    ],
  },
};

module.exports = nextConfig;
