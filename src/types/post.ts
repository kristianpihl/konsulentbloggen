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
}
