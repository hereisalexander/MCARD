import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MCARD | Pokémon TCG Market Telemetry & Vault",
    short_name: "MCARD",
    description: "即時市場遙測、頂級卡牌檔案庫與高性能投資組合追蹤系統",
    start_url: "/",
    id: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#121212",
    theme_color: "#E10600",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["finance", "shopping", "entertainment"],
    shortcuts: [
      {
        name: "探索市場 Explore",
        url: "/?tab=explore",
        description: "瀏覽最新釋出的珍稀寶可夢卡牌",
      },
      {
        name: "藏品資產庫 Vault",
        url: "/?tab=portfolio",
        description: "檢視您的投資組合總值與損益",
      },
      {
        name: "卡牌雷達 Wishlist",
        url: "/?tab=wishlist",
        description: "查看降價追蹤與關注卡牌",
      },
    ],
  };
}
