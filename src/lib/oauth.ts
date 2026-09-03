import * as WebBrowser from 'expo-web-browser';
import {
  GoogleOneTapSignIn,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
} from 'react-native-nitro-google-signin';

WebBrowser.maybeCompleteAuthSession();

// Graph API versions are only guaranteed for 2 years from release - pin to a
// version well before its sunset date rather than whatever was current when
// this was written, or this dialog silently breaks again down the line.
const FACEBOOK_DISCOVERY = {
  authorizationEndpoint: 'https://www.facebook.com/v25.0/dialog/oauth',
};

// Google deprecated custom-URI-scheme redirects for Android apps ("Custom URI
// schemes are no longer supported on Android and Chrome apps" - this is why
// the old expo-auth-session browser flow got "invalid_request" no matter what
// response_type/PKCE combination we tried). The supported replacement is
// Credential Manager: a native Play Services call, no browser, no redirect
// URI at all. `clientId` here must be a "Web application" type OAuth client
// (not the "Android" type client, which stays registered only for its
// package name + SHA-1 fingerprint - Credential Manager checks that
// automatically in the background). The id_token's `aud` will be this web
// client id, which is what the backend verifies against.
let configuredFor: string | null = null;

export async function signInWithGoogle(clientId: string): Promise<string> {
  if (configuredFor !== clientId) {
    GoogleOneTapSignIn.configure({ webClientId: clientId });
    configuredFor = clientId;
  }

  try {
    await GoogleOneTapSignIn.checkPlayServices();
    let response = await GoogleOneTapSignIn.signIn();

    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }

    if (!isSuccessResponse(response)) throw new Error('cancelled');

    const idToken = response.data.idToken;
    if (!idToken) throw new Error('Không nhận được id token từ Google.');
    return idToken;
  } catch (err) {
    if (isErrorWithCode(err) && err.code === 'SIGN_IN_CANCELLED') throw new Error('cancelled');
    throw err;
  }
}

// Facebook's Valid OAuth Redirect URIs field only accepts https:// URLs, so we
// can't hand it the app's rewally:// scheme directly. Instead Facebook
// redirects to our own https relay page (server-side, static HTML), whose
// inline script forwards the URL fragment on to rewally://oauthredirect -
// which is the deep link this app is actually registered to receive.
const FACEBOOK_RELAY_URI = 'https://refundmoney.tro247.online/app/oauth/relay';
const FACEBOOK_APP_REDIRECT = 'rewally://oauthredirect';

function parseFragmentParams(url: string): Record<string, string> {
  const splitAt = url.indexOf('#') !== -1 ? url.indexOf('#') : url.indexOf('?');
  if (splitAt === -1) return {};
  const params: Record<string, string> = {};
  for (const pair of url.slice(splitAt + 1).split('&')) {
    const [key, value] = pair.split('=');
    if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return params;
}

export async function signInWithFacebook(appId: string): Promise<string> {
  const authUrl =
    `${FACEBOOK_DISCOVERY.authorizationEndpoint}?client_id=${encodeURIComponent(appId)}` +
    `&redirect_uri=${encodeURIComponent(FACEBOOK_RELAY_URI)}` +
    `&response_type=token&scope=${encodeURIComponent('public_profile,email')}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, FACEBOOK_APP_REDIRECT);
  if (result.type !== 'success') {
    throw new Error(result.type === 'cancel' || result.type === 'dismiss' ? 'cancelled' : 'Đăng nhập Facebook thất bại.');
  }

  const accessToken = parseFragmentParams(result.url).access_token;
  if (!accessToken) throw new Error('Không nhận được access token từ Facebook.');
  return accessToken;
}
