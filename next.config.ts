import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    images: {
        // Reusing optimized images across route changes is especially useful in
        // Telegram/iOS WebViews where bandwidth and CPU can be constrained.
        minimumCacheTTL: 60 * 60 * 24 * 7,
    },
};

export default nextConfig;
