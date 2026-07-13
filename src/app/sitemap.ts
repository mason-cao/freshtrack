import type { MetadataRoute } from "next";
import { foods } from "@/lib/foods";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const foodEntries: MetadataRoute.Sitemap = foods.map((food) => ({
    url: `${siteUrl}/foods/${food.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${siteUrl}/`,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/foods`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...foodEntries,
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
