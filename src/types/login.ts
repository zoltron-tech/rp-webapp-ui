export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  message: string;
}
