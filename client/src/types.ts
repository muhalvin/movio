export type User = {
  id: number;
  email: string;
  username?: string | null;
  role: "USER" | "ADMIN";
};

export type Movie = {
  id: number;
  title: string;
  description?: string | null;
  release_date: string;
  genres: string[];
  average_rating: number;
  review_count: number;
};

export type Review = {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  comment?: string | null;
};

export type AuthPayload = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
