import type { AppUser } from './types';

// OAuth-only users have no phone; phone-registered users have no fullName -
// fall back through whichever real fields are actually populated.
export function getDisplayName(user: AppUser | null | undefined): string {
  return user?.fullName || user?.phone || 'Cộng tác viên';
}
