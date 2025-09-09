// src/lib/categories.js
export const CATEGORIES = [
  { slug: "lessons", label: "Lessons & Tutoring" }, // languages, music, academics
  { slug: "creative", label: "Creative & Media" }, // photo/video, design, writing
  { slug: "tech", label: "Tech & Digital" }, // web/dev, IT support, data
  { slug: "home", label: "Home & Lifestyle" }, // cleaning, gardening, repairs
  { slug: "wellness", label: "Wellness & Personal" }, // fitness, coaching, beauty
  { slug: "events", label: "Events & Hospitality" }, // catering, DJ, bartending
  { slug: "business", label: "Business & Admin" }, // bookkeeping, VA, consulting
  { slug: "logistics", label: "Transport & Logistics" }, // moving, delivery, bike repair
  { slug: "other", label: "Other" },
];

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || "Other";
}
