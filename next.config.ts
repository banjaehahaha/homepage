import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/playhomesweethome',
        destination: '/diagram/modal/projects/play-home',
        permanent: true,
      },
      {
        source: '/makehomesweethome',
        destination: '/diagram/modal/projects/make-home',
        permanent: true,
      },
      // 다른 리다이렉트도 필요하면 여기 추가
    ];
  },
};

export default nextConfig;
