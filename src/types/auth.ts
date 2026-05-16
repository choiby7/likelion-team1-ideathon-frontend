export type LoginType = "KAKAO";

export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage: string | null;
  loginType: LoginType;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  isNewUser: boolean;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}
