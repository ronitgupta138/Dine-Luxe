import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/**" },
    ],
  },
  serverExternalPackages: ["socket.io-client"],
};
 
export default nextConfig;
