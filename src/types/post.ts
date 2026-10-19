export type PostStatus = "draft" | "published";

// Maks antall tegn (inkludert mellomrom) i selve innleggsteksten.
export const MAX_POST_CONTENT_LENGTH = 4500;

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  status: PostStatus;
  // Valgfri lenke til en mal eller et verktøy (finnes først etter migrasjon 013).
  resource_id?: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  tags: string[];
  status: PostStatus;
  // Utelatt hvis skjemaet ikke har feltet (da røres ikke kolonnen).
  resource_id?: string | null;
}
