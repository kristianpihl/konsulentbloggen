export type PostStatus = "draft" | "published";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
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
  tags: string[];
  status: PostStatus;
}
