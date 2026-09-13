import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Unngår at Turbopack plukker opp en package-lock.json et sted lenger
    // opp i mappestrukturen (f.eks. i brukerens hjemmemappe) som prosjektrot.
    root: path.join(__dirname),
  },
};

export default nextConfig;
