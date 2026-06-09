export interface OidcConfig {
  authority: string;
  client_id: string;
  redirect_uri: string;
  post_logout_redirect_uri: string;
  scope: string;
  response_type: string;
}

export function getOidcConfig(): OidcConfig {
  const authority = process.env.NEXT_PUBLIC_OIDC_AUTHORITY;
  const client_id = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
  const redirect_uri = process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI;
  const post_logout_redirect_uri = process.env.NEXT_PUBLIC_OIDC_POST_LOGOUT_REDIRECT_URI;
  const scope = process.env.NEXT_PUBLIC_OIDC_SCOPE;

  if (!authority || !client_id || !redirect_uri || !post_logout_redirect_uri || !scope) {
    throw new Error("Missing required OIDC environment variables. Check your .env setup.");
  }

  return {
    authority,
    client_id,
    redirect_uri,
    post_logout_redirect_uri,
    scope,
    response_type: "code",
  };
}
