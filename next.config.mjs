/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "blr1.digitaloceanspaces.com",
            },
        ],
    },
    experimental: {missingSuspenseWithCSRBailout: false,},
};

export default nextConfig;