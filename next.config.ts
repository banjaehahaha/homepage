import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/playhomesweethome',
        destination: '/projects/play-home',
        permanent: true,
      },
      {
        source: '/makehomesweethome',
        destination: '/projects/make-home',
        permanent: true,
      },
      // 다른 리다이렉트도 필요하면 여기 추가
    ];
  },
};

export default nextConfig;
