const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  assetPrefix: isProd ? '/TestNextApi/' : '',
  basePath:  isProd ? '/TestNextApi' : '', // 👈 加這個！
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

