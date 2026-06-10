export function getAccountUrl(): string {
  let authority =
    process.env.NEXT_PUBLIC_OIDC_AUTHORITY || "https://sso.skill-wanderer.com/realms/reltroner";
  if (authority.endsWith("/")) {
    authority = authority.slice(0, -1);
  }
  return `${authority}/account`;
}
