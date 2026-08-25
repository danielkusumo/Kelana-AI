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