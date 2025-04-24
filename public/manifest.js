"use client";
export default function manifest() {
  return {
    name: "PerioScan",
    short_name: "PerioScan",
    description:
      "Solução digital especializada no gerenciamento de perícias odontológicas forenses",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/images/icons/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/images/icons/logo-periocan114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        src: "/images/icons/logo-periocan196.png",
        sizes: "196x196",
        type: "image/png",
      },
      {
        src: "/images/icons/logo-periocan256.png",
        sizes: "256x256",
        type: "image/png",
      },

      {
        purpose: "maskable",
        sizes: "1280x1280",
        src: "maskable_icon.png",
        type: "image/png",
      },

      {
        purpose: "maskable",
        sizes: "384x384",
        src: "/images/icons/maskable_icon_x384.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/images/icons/maskable_icon_x512.png",
        type: "image/png",
      },
    ],
  };
}
