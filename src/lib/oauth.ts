import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DISCOVERY = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
};

const FACEBOOK_DISCOVERY = {
  authorizationEndpoint: 'https://www.facebook.com/v19.0/dialog/oauth',
};

// Google's OIDC id_token is verified server-side against `aud` - the nonce here
// only protects the client-side redirect, not the backend trust boundary.
export async function signInWithGoogle(clientId: string): Promise<string> {
  const redirectUri = AuthSession.makeRedirectUri();
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
    extraParams: { nonce: Math.random().toString(36).slice(2) },
  });

  const result = await request.promptAsync(GOOGLE_DISCOVERY);
  if (result.type !== 'success') {
    throw new Error(result.type === 'cancel' || result.type === 'dismiss' ? 'cancelled' : 'Đăng nhập Google thất bại.');
  }

  const idToken = result.params?.id_token;
  if (!idToken) throw new Error('Không nhận được id token từ Google.');
  return idToken;
}

export async function signInWithFacebook(appId: string): Promise<string> {
  const redirectUri = AuthSession.makeRedirectUri();
  const request = new AuthSession.AuthRequest({
    clientId: appId,
    redirectUri,
    responseType: AuthSession.ResponseType.Token,
    scopes: ['public_profile', 'email'],
  });

  const result = await request.promptAsync(FACEBOOK_DISCOVERY);
  if (result.type !== 'success') {
    throw new Error(result.type === 'cancel' || result.type === 'dismiss' ? 'cancelled' : 'Đăng nhập Facebook thất bại.');
  }

  const accessToken = result.params?.access_token;
  if (!accessToken) throw new Error('Không nhận được access token từ Facebook.');
  return accessToken;
}
