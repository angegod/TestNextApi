const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  //assetPrefix: isProd ? '/TestNextApi/' : '',
  basePath:  process.env.DEPLOYED_GITHUB_PATH || '', // 👈 加這個！
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

