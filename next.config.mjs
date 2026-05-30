import path from "node:path";

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

    sassOptions: {
        includePaths: [path.resolve(process.cwd(), "src")],
    },
};

export default nextConfig;
