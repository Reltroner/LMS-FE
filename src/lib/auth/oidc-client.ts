import { UserManager, WebStorageStateStore, UserManagerSettings } from "oidc-client-ts";
import { getOidcConfig } from "./oidc-config";

let userManager: UserManager | null = null;

export function getUserManager(): UserManager {
  if (typeof window === "undefined") {
    throw new Error("getUserManager cannot be called on the server");
  }

  if (!userManager) {
    const config = getOidcConfig();
    const settings: UserManagerSettings = {
      authority: config.authority,
      client_id: config.client_id,
      redirect_uri: config.redirect_uri,
      post_logout_redirect_uri: config.post_logout_redirect_uri,
      response_type: config.response_type,
      scope: config.scope,
      userStore: new WebStorageStateStore({ store: window.sessionStorage }),
      // Ensures PKCE is used (default is true in oidc-client-ts)
    };

    userManager = new UserManager(settings);
  }

  return userManager;
}
