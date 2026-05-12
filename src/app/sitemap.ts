import type { MetadataRoute } from "next";
import { foods } from "@/lib/foods";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const foodEntries: MetadataRoute.Sitemap = foods.map((food) => ({
    url: `${siteUrl}/foods/${food.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/foods`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...foodEntries,
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
