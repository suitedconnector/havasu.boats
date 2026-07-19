/** @type {import('next').NextConfig} */
const nextConfig = {
  // We deliberately do NOT set typescript.ignoreBuildErrors or
  // eslint.ignoreDuringBuilds — those were shortcuts the earlier project
  // took that we're not inheriting. Real errors get seen.

  images: {
    // Allow the Google-hosted photos from Outscraper output. next/image
    // still optimizes these at build/request time; the whitelist is a
    // security requirement, not a performance opt-out.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "lh4.googleusercontent.com" },
      { protocol: "https", hostname: "lh5.googleusercontent.com" },
      { protocol: "https", hostname: "lh6.googleusercontent.com" },
      { protocol: "https", hostname: "lh7-us.googleusercontent.com" },
      { protocol: "https", hostname: "streetviewpixels-pa.googleapis.com" },
    ],
  },

  // Every listing/category page is statically generated at build time via
  // generateStaticParams. No dynamic runtime, no backend at launch. When
  // you add paid-listing features, most pages stay static — only the
  // account/lead routes go dynamic.
};

export default nextConfig;
