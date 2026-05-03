import { OAuth2Client } from "google-auth-library";

export const OAUTH_GOOGLE_STATE_COOKIE = "oauth_google_state";

export function getGoogleRedirectUri(): string {
  const uri = process.env.AUTH_GOOGLE_REDIRECT_URI?.trim();
  if (!uri) {
    throw new Error("AUTH_GOOGLE_REDIRECT_URI is not set");
  }
  return uri;
}

export function createGoogleOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set");
  }
  return new OAuth2Client(clientId, clientSecret, getGoogleRedirectUri());
}

export function getGoogleAuthorizeUrl(state: string): string {
  const client = createGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
    ],
    state,
    prompt: "select_account",
  });
}
