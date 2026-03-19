/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "html-pdf-node",
        "puppeteer",
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
