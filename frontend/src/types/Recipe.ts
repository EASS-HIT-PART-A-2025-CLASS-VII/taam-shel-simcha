export interface Recipe {
  id: number;
  title: string;
  description: string;
  image_url?: string;       // תמונה (רשות)
  video_url?: string;       // קישור ליוטיוב (אם יש)
  creator_name: string;     // שם היוצר
  average_rating?: number;          // דירוג ממוצע (אם אתה משתמש בו)
}
