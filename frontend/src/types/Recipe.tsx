// types/Recipe.ts

export interface Recipe {
  id: number;
  title: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  image_url?: string;
  video_url?: string;
  creator_name?: string;
  user_id: number;
  average_rating?: number;
  created_at?: string;
  is_public: boolean;
  share_token?: string;

  // שדות חדשים
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  prep_time: string;
  servings?: number;
  tags?: string[];
}
