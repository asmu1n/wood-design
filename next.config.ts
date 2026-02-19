import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cloud.asmuin.top'
            }
        ]
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '30mb'
        }
    },
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    }
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
