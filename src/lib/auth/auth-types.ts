export interface AuthUser {
  sub: string;
  email?: string;
  name?: string;
  preferredUsername?: string;
  rawProfile: Record<string, unknown>;
}

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  error: Error | null;
}

export interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  handleCallback: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
