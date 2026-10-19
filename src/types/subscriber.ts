export interface Subscriber {
  id: string;
  email: string;
  wants_posts: boolean;
  wants_resources: boolean;
  status: "active" | "unsubscribed";
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}
