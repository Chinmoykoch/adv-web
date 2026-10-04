import type { NextConfig } from "next";

// Images uploaded in the admin panel live in the Supabase Storage "media" bucket. Allowing only
// that bucket's public path lets next/image resize them per device without opening the
// optimizer to arbitrary sites.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/media/**`)] : [],
  },
};

export default nextConfig;
