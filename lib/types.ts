export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  created_at: string;
};

export type Chirp = {
  id: string;
  user_id: string;
  text: string | null;
  media_url: string | null;
  is_gif: boolean;
  created_at: string;
  // Joined / derived fields used by the UI.
  author?: Profile;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
};

export type Comment = {
  id: string;
  user_id: string;
  chirp_id: string;
  text: string;
  created_at: string;
  author?: Profile;
};

export type Gif = {
  id: string;
  url: string;
  preview: string;
  description: string;
};
