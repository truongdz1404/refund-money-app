import { useEffect, useState } from 'react';

import { clearToken, readToken, writeToken } from '@/lib/secureStore';
import type { AppUser } from '@/lib/types';

// undefined = not loaded from SecureStore yet (splash), null = logged out.
type AuthSnapshot = { token: string | null | undefined; user: AppUser | null };

let snapshot: AuthSnapshot = { token: undefined, user: null };
const listeners = new Set<() => void>();

function publish() {
  for (const listener of listeners) listener();
}

const READ_TOKEN_TIMEOUT_MS = 5000;

export async function initAuth(): Promise<void> {
  // readToken() goes through a native SecureStore/Keystore call that has been
  // observed to hang indefinitely on some Android emulator images, which would
  // otherwise leave `token` stuck at `undefined` and the app stuck on a blank
  // splash forever. Fall back to logged-out rather than hang the whole app.
  const token = await Promise.race([
    readToken(),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), READ_TOKEN_TIMEOUT_MS)),
  ]);
  snapshot = { token, user: null };
  publish();
}

export async function signIn(token: string, user: AppUser): Promise<void> {
  await writeToken(token);
  snapshot = { token, user };
  publish();
}

export async function signOut(): Promise<void> {
  await clearToken();
  snapshot = { token: null, user: null };
  publish();
}

export function setCurrentUser(user: AppUser): void {
  snapshot = { ...snapshot, user };
  publish();
}

export function getAuthToken(): string | null | undefined {
  return snapshot.token;
}

export function useAuth() {
  const [state, setState] = useState(snapshot);
  useEffect(() => {
    const listener = () => setState(snapshot);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return state;
}
