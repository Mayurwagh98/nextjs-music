import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/catalog";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await getCourses();
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/waitlist`, changeFrequency: "monthly", priority: 0.5 },
    ...courses.map((course) => ({
      url: `${site.url}/courses/${course.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
