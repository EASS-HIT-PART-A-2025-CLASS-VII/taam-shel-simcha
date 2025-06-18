export interface User  {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  wants_emails: boolean;
  profile_image_url: string | null;
};
