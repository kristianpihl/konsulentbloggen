export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  nav_order: number;
  created_at: string;
  updated_at: string;
}

export interface StaticPageInput {
  slug: string;
  title: string;
  content: string;
  cover_image_url: string;
}

// Slugs som allerede brukes av faste ruter i appen — kan ikke gjenbrukes
// som slug for en statisk side, da den faste ruten uansett vinner og
// siden aldri ville blitt vist.
export const RESERVED_PAGE_SLUGS = [
  "blog",
  "kategori",
  "sok",
  "nyhetsbrev",
  "admin",
  "api",
];
