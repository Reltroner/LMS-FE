"use client";

import React, { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import { AuthContextValue, AuthState, AuthUser } from "@/lib/auth/auth-types";
import { getUserManager } from "@/lib/auth/oidc-client";
import { User } from "oidc-client-ts";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  });

  const mapOidcUserToAuthUser = (oidcUser: User): AuthUser => ({
    sub: oidcUser.profile.sub,
    email: oidcUser.profile.email,
    name: oidcUser.profile.name,
    preferredUsername: oidcUser.profile.preferred_username,
    rawProfile: oidcUser.profile as Record<string, unknown>,
  });

  const loadUser = useCallback(async () => {
    try {
      const userManager = getUserManager();
      const oidcUser = await userManager.getUser();

      if (oidcUser && !oidcUser.expired) {
        setState({
          isLoading: false,
          isAuthenticated: true,
          user: mapOidcUserToAuthUser(oidcUser),
          error: null,
        });
      } else {
        setState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error : new Error("Unknown auth error"),
      });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async () => {
    try {
      const userManager = getUserManager();
      await userManager.signinRedirect();
    } catch (error) {
      console.error("Failed to login:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Login failed"),
      }));
    }
  };

  const logout = async () => {
    try {
      const userManager = getUserManager();
      await userManager.signoutRedirect();
    } catch (error) {
      console.error("Failed to logout:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Logout failed"),
      }));
    }
  };

  const handleCallback = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const userManager = getUserManager();
      const oidcUser = await userManager.signinRedirectCallback();

      setState({
        isLoading: false,
        isAuthenticated: true,
        user: mapOidcUserToAuthUser(oidcUser),
        error: null,
      });
    } catch (error) {
      console.error("Failed to process callback:", error);
      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: error instanceof Error ? error : new Error("Callback processing failed"),
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    handleCallback,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
