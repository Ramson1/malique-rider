import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Malique Rider — Delivery Management",
    short_name: "Malique Rider",
    description:
      "Dispatch rider app for Malique Oil and Gas. Manage deliveries, track earnings, and navigate routes.",
    start_url: "/dashboard",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#0A1628",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
