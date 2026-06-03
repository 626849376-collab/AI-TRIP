/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["images.unsplash.com"],
    },
    // Enable experimental features
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
};

module.exports = nextConfig;
