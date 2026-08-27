// Map a destination name/query to a hero image.
// Images live in /public (America, China, Indonesia, Japan, Singapore, world)

const DESTINATION_IMAGES: { keywords: string[]; src: string }[] = [
  {
    keywords: ["america", "usa", "united states", "amerika", "new york", "los angeles", "san francisco", "chicago"],
    src: "/America.jpg",
  },
  {
    keywords: ["china", "cina", "beijing", "shanghai", "guangzhou", "shenzhen", "guilin", "hong kong"],
    src: "/China.jpg",
  },
  {
    keywords: ["indonesia", "bali", "jakarta", "bandung", "yogyakarta", "surabaya", "lombok", "ubud", "flores"],
    src: "/Indonesia.jpg",
  },
  {
    keywords: ["japan", "jepang", "tokyo", "osaka", "kyoto", "hokkaido", "fukuoka", "nagoya", "sapporo"],
    src: "/Japan.jpg",
  },
  {
    keywords: ["singapore", "singapura"],
    src: "/Singapore.jpg",
  },
];

export function getDestinationImage(destination: string): string {
  const query = (destination || "").toLowerCase();
  for (const entry of DESTINATION_IMAGES) {
    if (entry.keywords.some((kw) => query.includes(kw))) {
      return entry.src;
    }
  }
  return "/world.jpg";
}

// Emoji flag mapping (same keyword groups as the hero images)
const DESTINATION_FLAGS: { keywords: string[]; flag: string }[] = [
  {
    keywords: ["america", "usa", "united states", "amerika", "new york", "los angeles", "san francisco", "chicago"],
    flag: "🇺🇸",
  },
  {
    keywords: ["china", "cina", "beijing", "shanghai", "guangzhou", "shenzhen", "guilin", "hong kong"],
    flag: "🇨🇳",
  },
  {
    keywords: ["indonesia", "bali", "jakarta", "bandung", "yogyakarta", "surabaya", "lombok", "ubud", "flores"],
    flag: "🇮🇩",
  },
  {
    keywords: ["japan", "jepang", "tokyo", "osaka", "kyoto", "hokkaido", "fukuoka", "nagoya", "sapporo"],
    flag: "🇯🇵",
  },
  {
    keywords: ["singapore", "singapura"],
    flag: "🇸🇬",
  },
];

export function getDestinationFlag(destination: string): string {
  const query = (destination || "").toLowerCase();
  for (const entry of DESTINATION_FLAGS) {
    if (entry.keywords.some((kw) => query.includes(kw))) {
      return entry.flag;
    }
  }
  return "🌍";
}

// Format an amount as "USD 2,000"
export function formatBudget(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Color-coded badge styles per category
const CATEGORY_STYLES: Record<string, string> = {
  Backpacker: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  Standard: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  Luxury: "bg-amber-500/15 border-amber-500/40 text-amber-300",
};

export function getCategoryStyle(category: string): string {
  return (
    CATEGORY_STYLES[category] ||
    "bg-violet-500/15 border-violet-500/40 text-violet-300"
  );
}

// Badge style per travel style (heuristically colored)
const TRAVEL_STYLES: Record<string, string> = {
  Family: "bg-pink-500/15 border-pink-500/40 text-pink-300",
  Solo: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  Couple: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  Backpacker: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  Luxury: "bg-amber-500/15 border-amber-500/40 text-amber-300",
};

export function getTravelStyleStyle(travelStyle: string): string {
  const key = (travelStyle || "").toLowerCase();
  for (const style in TRAVEL_STYLES) {
    if (key.includes(style.toLowerCase())) return TRAVEL_STYLES[style];
  }
  return "bg-white/10 border-white/20 text-white/80";
}