/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Tree-shakes the icon barrels so each file ships only the icons it imports,
    // and lets framer-motion/lucide be optimized on import. Cuts client bundle
    // weight across every page that uses them.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

module.exports = nextConfig;
